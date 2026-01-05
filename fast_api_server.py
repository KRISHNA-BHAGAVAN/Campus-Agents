import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Import the agent graph
from placement_cell_agent.graph import graph
from placement_cell_agent.models import InterviewRound, MockTest, Question

load_dotenv()

app = FastAPI(title="Placement Cell Agent API")

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, allow all. In prod, specify domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JDRequest(BaseModel):
    job_description: str

class AgentResponse(BaseModel):
    company_name: Optional[str]
    role_name: Optional[str]
    inferred_rounds: List[Dict[str, Any]]
    generated_tests: List[Dict[str, Any]]
    research_confidence: float
    web_research_results: Optional[str]
    errors: List[str]

def pydantic_to_dict(obj):
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "dict"):
        return obj.dict()
    if isinstance(obj, list):
        return [pydantic_to_dict(i) for i in obj]
    if isinstance(obj, dict):
        return {k: pydantic_to_dict(v) for k, v in obj.items()}
    return obj

@app.post("/generate", response_model=AgentResponse)
async def generate_interview_plan(request: JDRequest):
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Job Description cannot be empty")
        
    try:
        print(f"Received JD for processing (preview): {request.job_description[:50]}...")
        
        initial_state = {
            "job_description": request.job_description,
            "company_name": None,
            "role_name": None,
            "inferred_rounds": [],
            "generated_tests": [],
            "errors": [],
            "needs_web_research": False, # Will be set by graph
            "research_confidence": 0.0,
            "web_research_results": None
        }
        
        # Invoke LangGraph
        result = graph.invoke(initial_state)
        
        # Process Results
        response = AgentResponse(
            company_name=result.get("company_name"),
            role_name=result.get("role_name"),
            inferred_rounds=pydantic_to_dict(result.get("inferred_rounds", [])),
            generated_tests=pydantic_to_dict(result.get("generated_tests", [])),
            research_confidence=result.get("research_confidence", 0.0),
            web_research_results=result.get("web_research_results"),
            errors=result.get("errors", [])
        )
        
        return response
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("fast_api_server:app", host="0.0.0.0", port=8000, reload=True)
