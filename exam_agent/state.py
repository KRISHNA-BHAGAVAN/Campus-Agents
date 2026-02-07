from typing import List, TypedDict, Optional, Any
from .models import Student, Hall, Exam, TimetableEntry, SeatAllocation

class ExamState(TypedDict):
    # Input
    request: str
    workspace_id: str # Added workspace context
    
    # Context Data
    students: List[Student]
    halls: List[Hall]
    exams: List[Exam]
    
    # Intermediate/Output
    timetable: List[TimetableEntry]
    allocations: List[SeatAllocation]
    conflicts: List[str]
    
    # Flow Control
    status: str # 'planning', 'allocating', 'complete', 'error'
    errors: List[str]
    
    # Coordinator communication (optional)
    messages: List[Any]
