import json
from datetime import datetime
from typing import List, Dict, Any, Literal

from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, START, END
from pydantic import BaseModel

from .models import ExamPlan, TimetableEntry, SeatAllocation, Exam, Student, Hall
from .state import ExamState
from .utils import get_llm_for_task, mock_exams
from db import get_all_students, get_all_halls, get_all_buildings, get_all_exams

# --- Nodes ---
async def setup_node(state: ExamState) -> ExamState:
    """Initialize state with necessary data."""
    workspace_id = state.get("workspace_id")
    if not workspace_id:
         # Should not happen if validated by API model, but good for robustness
         return {
             **state, 
             "status": "error", 
             "errors": state.get("errors", []) + ["Internal Error: Workspace context missing"]
         }

    # Query DB
    students_data = await get_all_students(workspace_id)
    halls_data = await get_all_halls(workspace_id)
    # buildings_data = await get_all_buildings(workspace_id)
    
    # Map DB dicts to Pydantic models
    # DB docs contain 'id' field as seeded, which Pydantic uses.
    try:
        students = [Student(**s) for s in students_data]
        halls = [Hall(**h) for h in halls_data]
    except Exception as e:
        return {
            **state,
            "status": "error",
            "errors": state.get("errors", []) + [f"Data validation failed: {str(e)}"]
        }
    
    # exams = mock_exams()
    exams_data = await get_all_exams(workspace_id)
    exams = [Exam(**e) for e in exams_data]
    
    return {
        **state,
        "students": students,
        "halls": halls,
        "exams": exams,
        "status": "planning",
        "errors": state.get("errors", []),
        "conflicts": state.get("conflicts", [])
    }

class TimetableOutput(BaseModel):
    timetable: List[TimetableEntry]

def generate_timetable_node(state: ExamState) -> ExamState:
    """Use LLM to generate a valid timetable."""
    exams = state["exams"]
    
    llm = get_llm_for_task()
    structured_llm = llm.with_structured_output(TimetableOutput)
    
    prompt_text = """
    You are an expert exam scheduler. Create a timetable for the following exams.
    
    Exams:
    {exams}
    
    Constraints:
    - All exams must be scheduled between 9 AM and 5 PM.
    - Date range: Use relative dates like "Monday", "Tuesday" or specific fictitious dates (e.g. 2026-05-10).
    - No two exams for the same course (obviously).
    - Try to prevent scheduling exams on the same day if possible, but fit them all in.
    
    Return a list of TimetableEntry objects.
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", prompt_text),
        ("human", "Generate timetable.")
    ])
    
    try:
        # Convert exams to simple list of dicts for prompt
        exam_dicts = [e.model_dump() for e in exams]
        
        response = prompt | structured_llm
        result = response.invoke({"exams": json.dumps(exam_dicts, indent=2)})
        
        if not result or not result.timetable:
            return {**state, "errors": state.get("errors", []) + ["LLM returned empty timetable"]}

        # Post-process to add course names
        exam_map = {e.course_code: e.course_name for e in exams}
        for entry in result.timetable:
            entry.course_name = exam_map.get(entry.course_code, "Unknown")

        return {
            "timetable": result.timetable,
            "status": "allocating"
        }
    except Exception as e:
        return {
            **state,
            "errors": state.get("errors", []) + [f"Timetable generation failed: {str(e)}"],
            "status": "error"
        }

def allocate_halls_node(state: ExamState) -> ExamState:
    """Algorithmic node to allocate halls and seats."""
    # This node is NOT LLM-based to ensure correctness and efficiency with large numbers
    
    timetable = state["timetable"]
    students = state["students"]
    halls = state["halls"]
    
    allocations: List[SeatAllocation] = []
    conflicts: List[str] = []
    
    for entry in timetable:
        course_code = entry.course_code
        # Find enrolled students
        enrolled_students = [s for s in students if course_code in s.enrolled_courses]
        
        if not enrolled_students:
            continue
            
        # Allocate
        student_idx = 0
        
        # Naive allocation: Just fill halls one by one for this exam
        # In reality, we must check if hall is free at this time. 
        # For this prototype, we assume we reset halls for each exam slot 
        # OR we just check against capacity. 
        # TODO: Implement time-slot based hall availability tracking.
        
        for hall in halls:
            if student_idx >= len(enrolled_students):
                break
            
            seats_available = hall.capacity
            
            # Use 'seats_available' count of students
            count_for_hall = min(seats_available, len(enrolled_students) - student_idx)
            
            for i in range(count_for_hall):
                student = enrolled_students[student_idx]
                allocations.append(SeatAllocation(
                    student_id=student.id,
                    exam_course_code=course_code,
                    hall_id=hall.id,
                    seat_number=f"S-{i+1}"
                ))
                student_idx += 1
                
        if student_idx < len(enrolled_students):
            conflicts.append(f"Not enough capacity for {course_code}. {len(enrolled_students) - student_idx} students unassigned.")
            
    return {
        **state,
        "allocations": allocations,
        "conflicts": state.get("conflicts", []) + conflicts,
        "status": "validating"
    }

def validation_node(state: ExamState) -> ExamState:
    """Check for student conflicts (overlapping exams)."""
    allocations = state["allocations"]
    timetable = {t.course_code: t for t in state["timetable"]}
    
    student_schedule = {} # student_id -> list of slots
    
    new_conflicts = []
    
    # Build schedule check
    for alloc in allocations:
        sid = alloc.student_id
        exam = timetable.get(alloc.exam_course_code)
        if not exam: continue
        
        # Simplified time conflict check (string unique slot)
        slot = f"{exam.date}_{exam.start_time}"
        
        if sid not in student_schedule:
            student_schedule[sid] = []
            
        if slot in student_schedule[sid]:
            new_conflicts.append(f"Student {sid} has double booking at {slot}")
        else:
             student_schedule[sid].append(slot)
        
    return {
        **state,
        "conflicts": state.get("conflicts", []) + new_conflicts,
        "status": "complete"
    }

# --- Graph ---

builder = StateGraph(ExamState)

builder.add_node("setup", setup_node)
builder.add_node("generate_timetable", generate_timetable_node)
builder.add_node("allocate_halls", allocate_halls_node)
builder.add_node("validate", validation_node)

builder.add_edge(START, "setup")
builder.add_edge("setup", "generate_timetable")
builder.add_edge("generate_timetable", "allocate_halls")
builder.add_edge("allocate_halls", "validate")
builder.add_edge("validate", END)

exam_graph = builder.compile()
