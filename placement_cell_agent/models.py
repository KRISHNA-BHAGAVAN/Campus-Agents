from typing import List, Dict, Literal, Optional, Union
from pydantic import BaseModel, Field

class InterviewRound(BaseModel):
    round_name: str = Field(..., description="Name of the interview round")
    round_type: Literal["aptitude_mcq", "cs_mcq", "coding", "mixed"] = Field(..., description="Type of the round")
    importance: float = Field(..., description="Importance weight 0.0-1.0")
    topics: List[str] = Field(..., description="List of topics covered")
    expected_duration_min: int = Field(..., description="Expected duration in minutes")
    num_questions_estimate: int = Field(..., description="Estimated number of questions")
    source: Literal["jd_explicit", "jd_inferred"] = Field(..., description="Whether this round was explicitly in JD or inferred")

class Question(BaseModel):
    id: str = Field(..., description="Unique ID for the question")
    question_type: Literal["mcq", "coding"] = Field(..., description="Type of question")
    topic: str = Field(..., description="Topic this question belongs to")
    difficulty: Literal["easy", "medium", "hard"] = Field(..., description="Difficulty level")

    # MCQ fields
    question_text: Optional[str] = Field(None, description="Text for MCQ question")
    options: Optional[List[str]] = Field(None, description="Options for MCQ")
    correct_option_index: Optional[int] = Field(None, description="Index of correct option (0-3)")
    explanation: Optional[str] = Field(None, description="Explanation for reference")

    # Coding fields
    problem_statement: Optional[str] = Field(None, description="Problem statement for coding")
    input_format: Optional[str] = Field(None, description="Input format description")
    output_format: Optional[str] = Field(None, description="Output format description")
    constraints: Optional[str] = Field(None, description="Constraints")
    sample_tests: Optional[List[Dict[str, str]]] = Field(None, description="List of sample tests: {input, output, explanation}")

class MockTest(BaseModel):
    test_id: str = Field(..., description="Unique ID for the test")
    title: str = Field(..., description="Title of the test")
    round_type: str = Field(..., description="Round type this test corresponds to")
    duration_min: int = Field(..., description="Duration in minutes")
    num_questions: int = Field(..., description="Total number of questions")
    difficulty_profile: Dict[str, int] = Field(..., description="Map of difficulty to count, e.g. {'easy': 5, 'medium': 5}")
    topics: List[str] = Field(..., description="Topics covered in this test")
    questions: List[Question] = Field(default_factory=list, description="List of generated questions")
