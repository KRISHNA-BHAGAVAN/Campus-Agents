from typing import List, TypedDict, Optional, Any, Dict
from .models import Student, ExamCycle, TimetableEntry, CalendarEvent, Course, Room, RoomAllocation

class SchedulingState(TypedDict):
    # Input
    workspace_id: str
    request_data: dict # dict representation of ExamRequest
    
    # Context Data
    students: List[Student]
    courses: List[Course]  # Courses belonging to this exam cycle
    exam_cycle: ExamCycle
    holidays: List[CalendarEvent]
    
    # Output
    timetable: List[TimetableEntry]
    conflicts: List[str]
    
    # Flow Control
    status: str
    errors: List[str]


class AllocationState(TypedDict):
    # Input
    workspace_id: str
    request_data: dict  # AllocationRequest as dict
    
    # Context Data
    students: List[Student]
    rooms: List[Room]   # Selected rooms with full metadata
    timetable_entries: List[TimetableEntry]  # The exams to allocate for
    courses: List[Course]
    
    # Room-to-exam mapping: { "room_id": ["course_code1", ...] }
    room_exam_map: Dict[str, List[str]]
    
    # Output
    room_allocations: List[RoomAllocation]
    conflicts: List[str]
    
    # Flow Control
    status: str
    errors: List[str]

