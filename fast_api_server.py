import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Import the agent graph
# Import the agent graph
from placement_cell_agent.graph import graph
from placement_cell_agent.models import InterviewRound, MockTest, Question
from db import save_generation_to_db, get_generation_history

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
    id: Optional[str] = None # Added ID field
    company_name: Optional[str]
    role_name: Optional[str]
    inferred_rounds: List[Dict[str, Any]]
    generated_tests: List[Dict[str, Any]]
    research_confidence: float
    web_research_results: Optional[str]
    errors: List[str]
    created_at: Optional[str] = None # Added timestamp

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
        
        # Prepare data for response and DB
        response_data = {
            "company_name": result.get("company_name"),
            "role_name": result.get("role_name"),
            "inferred_rounds": pydantic_to_dict(result.get("inferred_rounds", [])),
            "generated_tests": pydantic_to_dict(result.get("generated_tests", [])),
            "research_confidence": result.get("research_confidence", 0.0),
            "web_research_results": result.get("web_research_results"),
            "errors": result.get("errors", [])
        }
        
        # Save to DB asynchronously
        # Note: In a real app, you might want this to be a background task
        # to not block response if DB is slow, but await is safer for data integrity here.
        saved_id = await save_generation_to_db(response_data)
        
        # Return response including the new ID
        return AgentResponse(**response_data, id=saved_id)
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history", response_model=List[AgentResponse])
async def get_history():
    try:
        history = await get_generation_history(limit=20)
        # Convert created_at to string for JSON serialization
        results = []
        for item in history:
            item["id"] = item.pop("_id") # Rename _id to id
            if "created_at" in item:
                item["created_at"] = item["created_at"].isoformat()
            results.append(AgentResponse(**item))
        return results
    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("fast_api_server:app", host="0.0.0.0", port=8000, reload=True)
