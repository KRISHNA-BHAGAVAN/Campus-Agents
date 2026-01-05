from typing import TypedDict, List, Optional, Annotated
import operator
from .models import InterviewRound, MockTest

class PlacementState(TypedDict):
    job_description: str
    company_name: Optional[str]
    role_name: Optional[str]
    inferred_rounds: List[InterviewRound]
    generated_tests: List[MockTest] # Specs (before generation)
    completed_tests: Annotated[List[MockTest], operator.add] # Final tests (after generation)
    errors: Annotated[List[str], operator.add] # Use reducer for errors too
    
    # Phase 2: Web Research Fields
    needs_web_research: bool
    web_research_queries: List[str]
    web_research_results: Optional[str]
    research_confidence: float # 0.0 to 1.0

