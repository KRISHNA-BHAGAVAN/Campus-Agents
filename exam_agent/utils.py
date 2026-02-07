import random
from typing import List
from .models import Student, Hall, Exam

def mock_students(count: int = 50) -> List[Student]:
    students = []
    courses = ["CS101", "CS102", "CS103", "MA101"]
    for i in range(count):
        s_id = f"S{1000+i}"
        name = f"Student_{i}"
        # Randomly assign 2-3 courses
        my_courses = random.sample(courses, k=random.randint(2, 3))
        students.append(Student(id=s_id, name=name, enrolled_courses=my_courses))
    return students

def mock_halls() -> List[Hall]:
    return [
        Hall(id="H101", name="Main Hall A", capacity=20),
        Hall(id="H102", name="Main Hall B", capacity=20),
        Hall(id="H201", name="Small Hall", capacity=15)
    ]

def mock_exams() -> List[Exam]:
    return [
        Exam(course_code="CS101", course_name="Intro to CS"),
        Exam(course_code="CS102", course_name="Data Structures"),
        Exam(course_code="CS103", course_name="Algorithms"),
        Exam(course_code="MA101", course_name="Calculus I")
    ]

# --- LLM Utils ---
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.language_models import BaseChatModel

def get_llm_for_task(context_size: int = 1000) -> BaseChatModel:
    """Simple router for LLM selection."""
    # Default to Groq Llama 3 or similar if available/configured
    # Using the same model name as placement agent for consistency
    return ChatGroq(
        model_name="openai/gpt-oss-120b",
        temperature=0.1
    )
