import json
import os
from dotenv import load_dotenv
from placement_cell_agent.graph import graph

# Load environment variables
load_dotenv(override=True)

def run_agent_and_save_output():
#     jd_text = """
#     EverUptime Intern with PPO Campus Drive for B.Tech (CSE,IT,IOT,AI&ML,DS,ECE,EEE) 2026 batch students for Software Engineer Intern | CTC: 8.00 LPA.

# About EverUptime

# EverUptime is a technology-driven company focused on building reliable, scalable, and high-performance software systems. We build modern platforms that help engineering teams operate production systems efficiently and reliably.

# What We Do

# * EverUptime is an AI-powered incident management platform that helps DevOps and engineering teams:
# * Detect system issues faster using intelligent monitoring
# * Automatically triage incidents using AI-driven insights
# * Reduce downtime with streamlined incident resolution workflows
# * Manage on-call schedules, incident alerts, and status pages — all from a single integrated platform
# * Our products are built using modern backend systems, cloud-native architectures, and AI-driven workflows to solve real-world reliability challenges.

# Role: Software Engineer – Intern

# Internship Duration: 6 Months

# Key Responsibilities:

# * Work on real-time software development projects
# * Collaborate with senior engineers and product teams
# * Design, develop, test, and maintain application features
# * Gain hands-on exposure to backend systems, cloud platforms, and scalable architectures

# What’s in It for You

# * Students selected for this role will gain a strong foundation in real-world software engineering, including:
# * Opportunity to build a production-grade AI product from the ground up
# * Work closely with the founding team and be part of EverUptime’s early-stage journey
# * Exposure to building systems that support mission-critical domains such as banking, healthcare, travel, and enterprise platforms
# * Learn how to design resilient, fault-tolerant systems that operate 24/7 with high availability
# * Hands-on experience with scalability, reliability engineering, and modern development practices

# Compensation & Career Progression

# * Internship Stipend: ₹25,000 per month (for 6 months)
# * Full-Time Offer (Post Internship): ₹8 LPA CTC upon successful conversion based on performance

# * Eligibility Criteria
# * Degree: B.Tech – CSE,IT,IOT,AI&ML,DS,ECE,EEE
# * Batch: 2026 Pass-out
# * Strong interest in software engineering and programming

# Shortlisting Criteria

# * We are looking for students with strong programming fundamentals and problem-solving skills.
# * Good understanding of data structures and algorithms
# * Hands-on coding experience
# * Competitive programming profiles (such as LeetCode, CodeChef, Codeforces, etc.) are good to have, but not mandatory

# Selection Process

# The recruitment process will consist of the following stages:

# Programming Test

# * System Design / System Test
# * Technical Interview – I
# * Technical Interview – II
# * Managerial (MR) Round
#     """

    jd_text="""Mastercard Hiring – Software Engineer Freshers (₹12.00–30.00 LPA)
Role: Software Engineer II (DevOps)
Eligible Branches: B.Tech (CSE, IT, IoT, AI & ML, DS, ECE)
"""
    print("🚀 Starting Agent with EverUptime JD...")
    
    # Invoke the graph
    inputs = {"job_description": jd_text}
    result = graph.invoke(inputs)
    
    # Filter out large raw objects if any, but user asked for "line to line output".
    # Pydantic models (MockTest, Question) need to be serialized to dicts.
    # The state contains explicit Pydantic objects which json.dump won't like by default.
    # We need a custom encoder or to convert them.
    # Fortunately, result is a dict, but 'generated_tests' contains Pydantic objects.
    
    # Helper to convert Pydantic to dict recursively
    def pydantic_converter(obj):
        if hasattr(obj, "model_dump"):
            return obj.model_dump()
        if hasattr(obj, "dict"):
            return obj.dict()
        if isinstance(obj, list):
            return [pydantic_converter(i) for i in obj]
        if isinstance(obj, dict):
            return {k: pydantic_converter(v) for k, v in obj.items()}
        return obj

    serializable_result = pydantic_converter(result)
    
    # Save to file
    output_filename = "MasterCard_output.json"
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(serializable_result, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Output written to {output_filename}")
    
    # Print summary to console
    print("\n--- Summary ---")
    print(f"Company: {serializable_result.get('company_name')}")
    print(f"Role: {serializable_result.get('role_name')}")
    print(f"Research Confidence: {serializable_result.get('research_confidence')}")
    print(f"Needs Research: {serializable_result.get('needs_web_research')}")
    
    rounds = serializable_result.get('inferred_rounds', [])
    print(f"\nInferred Rounds ({len(rounds)}):")
    for r in rounds:
        print(f"  - {r.get('round_name')} ({r.get('round_type')})")
        
    tests = serializable_result.get('completed_tests', [])
    print(f"\nGenerated Tests ({len(tests)}):")
    for t in tests:
        q_count = len(t.get('questions', []))
        print(f"  - {t.get('title')}: {q_count} questions")

if __name__ == "__main__":
    run_agent_and_save_output()
