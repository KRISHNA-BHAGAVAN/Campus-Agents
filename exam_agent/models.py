from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, EmailStr
import re

# --- Auth & Workspace Models ---

class User(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: EmailStr
    full_name: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Workspace(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    owner_id: str
    members: List[str] = Field(default_factory=list) # List of user_ids
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Invitation(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    workspace_id: str
    email: EmailStr
    token: str
    status: str = "pending" # pending, accepted, expired
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Exam Domain Models ---

class Department(BaseModel):
    id: str = Field(..., description="Department ID e.g., CSE")
    name: str = Field(..., description="Department Name e.g., Computer Science")
    workspace_id: str

class Program(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    code: str = Field(..., description="Program code e.g., BTECH")
    name: str = Field(..., description="Program name e.g., Bachelor of Technology")
    workspace_id: str

class Building(BaseModel):
    id: str = Field(..., description="Building ID e.g., BGB")
    name: str = Field(..., description="Building Name e.g., Bill Gates Bhavan")
    workspace_id: str

class Student(BaseModel):
    id: str = Field(..., description="Roll number/Student ID")
    name: str
    enrolled_courses: List[str] = Field(default_factory=list)
    program: str = "Unknown"
    department_id: str
    workspace_id: str

class Hall(BaseModel):
    id: str = Field(..., description="3 digit number, 1st digit is floor")
    name: str
    capacity: int
    rows: int = 10
    columns: int = 6
    building_id: str
    workspace_id: str

    @field_validator('id')
    @classmethod
    def validate_id(cls, v: str) -> str:
        if not re.match(r'^\d{3}$', v):
            raise ValueError('Hall ID must be a 3 digit number')
        return v

class Exam(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    course_code: str
    course_name: str
    duration_minutes: int = 180
    program_code: str = "Unknown"
    workspace_id: str

class Course(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    code: str
    name: str
    department_id: str
    program_code: str = "Unknown"
    workspace_id: str

class TimetableEntry(BaseModel):
    course_code: str
    course_name: Optional[str] = None
    date: str  # YYYY-MM-DD
    start_time: str # HH:MM
    end_time: str # HH:MM

class SeatAllocation(BaseModel):
    student_id: str
    exam_course_code: str
    hall_id: str
    seat_number: str

class ExamPlan(BaseModel):
    timetable: List[TimetableEntry]
    allocations: List[SeatAllocation]
    conflicts: List[str] = Field(default_factory=list)
