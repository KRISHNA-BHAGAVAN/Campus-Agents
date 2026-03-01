"""
Seat Allocation Graph — LangGraph-based seat allocation system.

Algorithm phases:
  Phase 1: One student per bench (spread out, interleave different courses)
  Phase 2: Corner-fill multi-seat benches (different course from existing occupant)
  Phase 3: Fill remaining seats (last resort, still prefer different courses)
"""
import json
from typing import List, Dict, Any, Literal
from collections import defaultdict

from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, START, END
from pydantic import BaseModel, Field

from .models import SeatAllocation, RoomAllocation, TimetableEntry, Room, Student, Course
from .state import AllocationState
from .utils import get_llm_for_task

SEATING_MULTIPLIER = {"Three": 3, "Two": 2, "Single": 1}


# ──────────────────────────────────────────────
#  OUTPUT SCHEMA FOR LLM
# ──────────────────────────────────────────────

class AllocationOutput(BaseModel):
    room_allocations: List[RoomAllocation] = Field(..., description="Modified room allocations after applying custom instructions")
    conflicts: List[str] = Field(default_factory=list)


# ──────────────────────────────────────────────
#  NODE: SETUP
# ──────────────────────────────────────────────

def allocation_setup_node(state: AllocationState) -> AllocationState:
    """Validate inputs and prepare for allocation."""
    errors = list(state.get("errors", []))
    
    if not state.get("rooms"):
        errors.append("No rooms provided for allocation.")
    if not state.get("timetable_entries"):
        errors.append("No exams selected for allocation.")
    if not state.get("students"):
        errors.append("No students found.")
    
    return {
        **state,
        "status": "planning",
        "errors": errors,
        "conflicts": state.get("conflicts", [])
    }


# ──────────────────────────────────────────────
#  NODE: ALGORITHMIC SEAT ALLOCATION
# ──────────────────────────────────────────────

def _build_bench_layout(room: Room):
    """
    Build the seating layout for a room.
    Returns a list of rows, each row is a list of benches.
    Each bench is a list of seat positions (max = seating multiplier).
    """
    seating = SEATING_MULTIPLIER.get(room.seating_type, 1)
    layout = []
    for r in range(room.rows):
        row_benches = []
        for c in range(room.columns):
            bench = [None] * seating  # None = empty seat
            row_benches.append(bench)
        layout.append(row_benches)
    return layout


def _interleave_students(student_groups: Dict[str, List[dict]]) -> List[dict]:
    """
    Interleave students from different course codes to maximize
    diversity in seating. Also sorts within each group by batch_year
    to separate same-batch students.
    
    Returns a flat list of student dicts with keys:
      student_id, student_name, course_code, program_id, batch_year
    """
    # Sort each group: alternate batch years for maximum separation
    for code in student_groups:
        student_groups[code].sort(key=lambda s: (s["batch_year"], s["student_id"]))
    
    # Round-robin across course codes
    codes = sorted(student_groups.keys())
    queues = {code: list(student_groups[code]) for code in codes}
    
    result = []
    while any(queues[c] for c in codes):
        for code in codes:
            if queues[code]:
                result.append(queues[code].pop(0))
    
    return result


def allocate_seats_algo_node(state: AllocationState) -> AllocationState:
    """
    Core deterministic seat allocation algorithm.
    
    For each (date, session) group of exams:
      1. Gather students per exam
      2. For each room assigned to those exams, allocate seats
      3. Use 3-phase filling for anti-cheating
    """
    errors = list(state.get("errors", []))
    if errors:
        return {**state, "status": "error"}
    
    rooms = state.get("rooms", [])
    timetable_entries = state.get("timetable_entries", [])
    students = state.get("students", [])
    courses = state.get("courses", [])
    room_exam_map = state.get("room_exam_map", {})
    
    # Build lookup maps
    room_map = {r.id: r for r in rooms}
    course_map = {c.code: c for c in courses}
    
    # Build student enrollment: course_code -> [student_dicts]
    student_map = {s.id: s for s in students}
    course_students: Dict[str, List[dict]] = defaultdict(list)
    
    for student in students:
        for cc in student.enrolled_courses:
            if cc in course_map:
                course_students[cc].append({
                    "student_id": student.id,
                    "student_name": student.name,
                    "course_code": cc,
                    "program_id": student.program_id,
                    "batch_year": student.batch_year
                })
    
    # Group timetable entries by (date, session)
    session_groups: Dict[str, List[TimetableEntry]] = defaultdict(list)
    for entry in timetable_entries:
        key = f"{entry.date}|{entry.session}"
        session_groups[key].append(entry)
    
    all_room_allocations: List[RoomAllocation] = []
    conflicts: List[str] = list(state.get("conflicts", []))
    
    # Track which students are already allocated in each (date, session)
    # to prevent double-booking
    allocated_students: Dict[str, set] = defaultdict(set)  # session_key -> {student_id}
    
    for session_key, entries in session_groups.items():
        date_str, session_str = session_key.split("|")
        
        # Collect all course codes in this session
        session_course_codes = [e.course_code for e in entries]
        
        # Find rooms assigned to exams in this session
        session_rooms = []
        for room_id, exam_codes in room_exam_map.items():
            # Check if any of this room's assigned exams are in this session
            matching_codes = [c for c in exam_codes if c in session_course_codes]
            if matching_codes and room_id in room_map:
                session_rooms.append((room_map[room_id], matching_codes))
        
        if not session_rooms:
            conflicts.append(f"No rooms assigned for exams on {date_str} ({session_str})")
            continue
        
        # Collect students for all exams in this session
        session_student_groups: Dict[str, List[dict]] = {}
        for code in session_course_codes:
            if code in course_students:
                # Filter out already-allocated students
                available = [
                    s for s in course_students[code]
                    if s["student_id"] not in allocated_students[session_key]
                ]
                if available:
                    session_student_groups[code] = available
        
        if not session_student_groups:
            conflicts.append(f"No students to allocate for {date_str} ({session_str})")
            continue
        
        # ── ALLOCATE ROOM BY ROOM ──
        for room, assigned_codes in session_rooms:
            # Gather students for the courses assigned to THIS room
            room_student_groups: Dict[str, List[dict]] = {}
            for code in assigned_codes:
                if code in session_student_groups:
                    room_student_groups[code] = list(session_student_groups[code])
            
            if not room_student_groups:
                continue
            
            # Interleave students across courses for anti-cheating
            interleaved = _interleave_students(room_student_groups)
            
            seating = SEATING_MULTIPLIER.get(room.seating_type, 1)
            total_bench_count = room.rows * room.columns
            total_seats = total_bench_count * seating
            
            # Build layout: layout[row][col] = [None, None, ...] (size = seating)
            layout = _build_bench_layout(room)
            
            seat_allocations: List[SeatAllocation] = []
            student_idx = 0
            total_students = len(interleaved)
            
            # ── PHASE 1: One student per bench ──
            # Place students in position 0 of each bench (left-most seat)
            for r in range(room.rows):
                for c in range(room.columns):
                    if student_idx >= total_students:
                        break
                    student = interleaved[student_idx]
                    layout[r][c][0] = student
                    row_letter = chr(65 + r)
                    seat_num = c * seating + 1
                    seat_allocations.append(SeatAllocation(
                        seat_label=f"{row_letter}{seat_num}",
                        bench_index=c,
                        seat_position=0,
                        student_id=student["student_id"],
                        student_name=student["student_name"],
                        course_code=student["course_code"],
                        program_id=student["program_id"],
                        batch_year=student["batch_year"]
                    ))
                    allocated_students[session_key].add(student["student_id"])
                    student_idx += 1
                if student_idx >= total_students:
                    break
            
            # ── PHASE 2: Corner-fill for multi-seat benches ──
            # For Three-seat: put at position 2 (rightmost corner)
            # For Two-seat: put at position 1
            if seating >= 2 and student_idx < total_students:
                fill_pos = seating - 1  # position 2 for Three, position 1 for Two
                for r in range(room.rows):
                    for c in range(room.columns):
                        if student_idx >= total_students:
                            break
                        if layout[r][c][0] is not None and layout[r][c][fill_pos] is None:
                            # Try to find a student with different course_code
                            existing_code = layout[r][c][0]["course_code"]
                            best_idx = None
                            # Search forward for a different course student
                            for search_i in range(student_idx, total_students):
                                if interleaved[search_i]["course_code"] != existing_code:
                                    best_idx = search_i
                                    break
                            
                            if best_idx is not None:
                                # Swap to front
                                interleaved[student_idx], interleaved[best_idx] = interleaved[best_idx], interleaved[student_idx]
                            
                            student = interleaved[student_idx]
                            layout[r][c][fill_pos] = student
                            row_letter = chr(65 + r)
                            seat_num = c * seating + fill_pos + 1
                            seat_allocations.append(SeatAllocation(
                                seat_label=f"{row_letter}{seat_num}",
                                bench_index=c,
                                seat_position=fill_pos,
                                student_id=student["student_id"],
                                student_name=student["student_name"],
                                course_code=student["course_code"],
                                program_id=student["program_id"],
                                batch_year=student["batch_year"]
                            ))
                            allocated_students[session_key].add(student["student_id"])
                            student_idx += 1
                    if student_idx >= total_students:
                        break
            
            # ── PHASE 3: Fill remaining middle seats (Three-seat only) ──
            if seating == 3 and student_idx < total_students:
                for r in range(room.rows):
                    for c in range(room.columns):
                        if student_idx >= total_students:
                            break
                        if layout[r][c][1] is None and (layout[r][c][0] is not None or layout[r][c][2] is not None):
                            # Try different course
                            existing_codes = set()
                            if layout[r][c][0]:
                                existing_codes.add(layout[r][c][0]["course_code"])
                            if layout[r][c][2]:
                                existing_codes.add(layout[r][c][2]["course_code"])
                            
                            best_idx = None
                            for search_i in range(student_idx, total_students):
                                if interleaved[search_i]["course_code"] not in existing_codes:
                                    best_idx = search_i
                                    break
                            
                            if best_idx is not None:
                                interleaved[student_idx], interleaved[best_idx] = interleaved[best_idx], interleaved[student_idx]
                            
                            student = interleaved[student_idx]
                            layout[r][c][1] = student
                            row_letter = chr(65 + r)
                            seat_num = c * seating + 2  # middle seat
                            seat_allocations.append(SeatAllocation(
                                seat_label=f"{row_letter}{seat_num}",
                                bench_index=c,
                                seat_position=1,
                                student_id=student["student_id"],
                                student_name=student["student_name"],
                                course_code=student["course_code"],
                                program_id=student["program_id"],
                                batch_year=student["batch_year"]
                            ))
                            allocated_students[session_key].add(student["student_id"])
                            student_idx += 1
                    if student_idx >= total_students:
                        break
            
            # ── PHASE 4: Fill completely empty benches if students remain ──
            if student_idx < total_students:
                for r in range(room.rows):
                    for c in range(room.columns):
                        for s_pos in range(seating):
                            if student_idx >= total_students:
                                break
                            if layout[r][c][s_pos] is None:
                                student = interleaved[student_idx]
                                layout[r][c][s_pos] = student
                                row_letter = chr(65 + r)
                                seat_num = c * seating + s_pos + 1
                                seat_allocations.append(SeatAllocation(
                                    seat_label=f"{row_letter}{seat_num}",
                                    bench_index=c,
                                    seat_position=s_pos,
                                    student_id=student["student_id"],
                                    student_name=student["student_name"],
                                    course_code=student["course_code"],
                                    program_id=student["program_id"],
                                    batch_year=student["batch_year"]
                                ))
                                allocated_students[session_key].add(student["student_id"])
                                student_idx += 1
                        if student_idx >= total_students:
                            break
                    if student_idx >= total_students:
                        break
            
            # Check for overflow
            if student_idx < total_students:
                remaining = total_students - student_idx
                conflicts.append(
                    f"Room {room.id} ({room.name}): {remaining} students could not be seated. "
                    f"Consider adding more rooms."
                )
            
            # Remove allocated students from session pool
            allocated_ids = {sa.student_id for sa in seat_allocations}
            for code in assigned_codes:
                if code in session_student_groups:
                    session_student_groups[code] = [
                        s for s in session_student_groups[code]
                        if s["student_id"] not in allocated_ids
                    ]
            
            # Gather metadata
            unique_codes = list(set(sa.course_code for sa in seat_allocations))
            unique_programs = list(set(sa.program_id for sa in seat_allocations if sa.program_id))
            unique_batches = list(set(sa.batch_year for sa in seat_allocations if sa.batch_year))
            course_names = [course_map[c].name for c in unique_codes if c in course_map]
            
            room_alloc = RoomAllocation(
                room_id=room.id,
                building_id=room.building_id,
                room_name=room.name,
                rows=room.rows,
                columns=room.columns,
                seating_type=room.seating_type,
                floor_id=room.floor_id,
                exam_date=date_str,
                exam_session=session_str,
                course_codes=unique_codes,
                course_names=course_names,
                program_ids=unique_programs,
                batch_years=unique_batches,
                allocations=seat_allocations,
                total_seats=total_seats,
                occupied_seats=len(seat_allocations)
            )
            all_room_allocations.append(room_alloc)
    
    return {
        **state,
        "room_allocations": all_room_allocations,
        "conflicts": conflicts,
        "status": "complete" if not errors else "error"
    }


# ──────────────────────────────────────────────
#  NODE: LLM MODIFICATION (only when custom instructions)
# ──────────────────────────────────────────────

def modify_allocation_llm_node(state: AllocationState) -> AllocationState:
    """Use AI to modify the algo-generated allocation based on custom instructions."""
    request_data = state.get("request_data", {})
    custom_inst = request_data.get("custom_instructions", "")
    room_allocations = state.get("room_allocations", [])
    
    if not room_allocations:
        return {**state, "errors": state.get("errors", []) + ["No allocation to modify."]}
    
    # Serialize current allocation for LLM context
    alloc_summary = []
    for ra in room_allocations:
        room_info = f"Room {ra.room_id} ({ra.room_name}) - {ra.building_id} - Floor {ra.floor_id}"
        room_info += f"\n  Date: {ra.exam_date}, Session: {ra.exam_session}"
        room_info += f"\n  Courses: {', '.join(ra.course_codes)}"
        room_info += f"\n  Layout: {ra.rows}×{ra.columns}, Seating: {ra.seating_type}"
        room_info += f"\n  Occupied: {ra.occupied_seats}/{ra.total_seats}"
        seat_details = []
        for sa in ra.allocations:
            seat_details.append(f"    {sa.seat_label}: {sa.student_id} ({sa.course_code}, batch {sa.batch_year})")
        room_info += "\n  Seats:\n" + "\n".join(seat_details)
        alloc_summary.append(room_info)
    
    alloc_str = "\n\n".join(alloc_summary)
    
    llm = get_llm_for_task()
    structured_llm = llm.with_structured_output(AllocationOutput)
    
    prompt_text = f"""
    You are an expert University Exam Seat Allocation Agent.
    
    I have an ALGORITHMICALLY GENERATED SEAT ALLOCATION below. Your task is to MODIFY it STRICTLY based on the CUSTOM INSTRUCTIONS provided by the user.
    
    CURRENT ALLOCATION:
    {alloc_str}
    
    CUSTOM INSTRUCTIONS:
    {custom_inst}
    
    RULES:
    - Keep all untouched allocations exactly as they are.
    - Only change what the custom instructions requires.
    - Ensure no student is double-allocated (same student in two places at same time).
    - Maintain the anti-cheating seating pattern where possible.
    - Return the COMPLETE list of room allocations (modified + unmodified).
    
    Return the complete modified allocation.
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", prompt_text),
        ("human", "Modify the seat allocation according to the custom instructions and return all room allocations.")
    ])
    
    try:
        response = prompt | structured_llm
        result = response.invoke({})
        
        if not result or not result.room_allocations:
            return {**state, "errors": state.get("errors", []) + ["LLM returned empty allocation"]}
        
        return {
            **state,
            "room_allocations": result.room_allocations,
            "conflicts": result.conflicts,
            "status": "complete"
        }
    except Exception as e:
        return {
            **state,
            "errors": state.get("errors", []) + [f"Allocation modification failed: {str(e)}"],
            "status": "error"
        }


# ──────────────────────────────────────────────
#  GRAPH CONSTRUCTION
# ──────────────────────────────────────────────

def should_use_llm_allocation(state: AllocationState) -> Literal["modify_allocation_llm", "__end__"]:
    request_data = state.get("request_data", {})
    custom_inst = request_data.get("custom_instructions", "").strip()
    if custom_inst:
        return "modify_allocation_llm"
    return "__end__"


alloc_builder = StateGraph(AllocationState)
alloc_builder.add_node("setup", allocation_setup_node)
alloc_builder.add_node("allocate_algo", allocate_seats_algo_node)
alloc_builder.add_node("modify_allocation_llm", modify_allocation_llm_node)

alloc_builder.add_edge(START, "setup")
alloc_builder.add_edge("setup", "allocate_algo")
alloc_builder.add_conditional_edges("allocate_algo", should_use_llm_allocation)
alloc_builder.add_edge("modify_allocation_llm", END)

allocation_graph = alloc_builder.compile()
