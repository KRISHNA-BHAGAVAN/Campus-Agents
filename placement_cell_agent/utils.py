from typing import List, Dict, Any, Union
import json
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.language_models import BaseChatModel

# Global cache for company research
_company_research_cache: Dict[str, str] = {}

def get_llm_for_task(task_type: str, context_size: int, force_gemini: bool = False) -> BaseChatModel:
    """
    Routes to the optimal LLM based on task type and context size.
    
    Args:
        task_type: "parsing", "reasoning", "research", or "deep_research"
        context_size: Approximate size of the context in characters (or tokens if known)
        force_gemini: If True, bypass logic and use Gemini
        
    Returns:
        A configured ChatModel (ChatGroq or ChatGoogleGenerativeAI)
    """
    
    # 1 token ~= 4 chars
    # Groq OpenAI-120B has 8k context window reliable? (Technically larger but let's be safe)
    # Gemini 1.5 Flash has 1M context
    
    GROQ_SAFE_LIMIT = 20000 # characters (~5k tokens)
    
    if force_gemini or context_size > GROQ_SAFE_LIMIT or task_type == "deep_research":
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.3
        )
    
    # Default to Groq for speed
    return ChatGroq(
        model_name="openai/gpt-oss-120b",
        temperature=0.3
    )

def truncate_search_results(results: List[Dict[str, Any]], max_chars: int = 15000) -> List[Dict[str, Any]]:
    """
    Keeps only the most relevant results within a token budget.
    Simple char-based truncation for efficiency.
    """
    filtered = []
    current_size = 0
    
    for result in results:
        # Convert to string to check size
        result_str = json.dumps(result)
        result_size = len(result_str)
        
        if current_size + result_size < max_chars:
            filtered.append(result)
            current_size += result_size
        else:
            break
            
    return filtered

def get_cached_research(company: str) -> Union[str, None]:
    """Retrieve cached research for a company."""
    return _company_research_cache.get(company.lower())

def cache_research(company: str, content: str):
    """Cache research results for a company."""
    if company and content:
        _company_research_cache[company.lower()] = content
