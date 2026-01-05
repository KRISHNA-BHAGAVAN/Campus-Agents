import os
import sys
import json
from dotenv import load_dotenv

# Load environment variables from .env file
# Assuming .env is in the project root
load_dotenv(override=True)

# Add the parent directory to sys.path to allow running as a script
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from placement_cell_agent.graph import graph
    from placement_cell_agent.models import MockTest
except ImportError:
    # If running from inside the package
    from .graph import graph
    from .models import MockTest

def generate_mock_tests_for_jd(job_description: str) -> list[MockTest]:
    """
    Main entrypoint to generate mock tests from a JD.
    """
    print(f"Starting generation for JD length: {len(job_description)}...")
    try:
        if not os.getenv("GROQ_API_KEY"):
            print("Warning: GROQ_API_KEY not found in environment variables.")
            
        initial_state = {
            "job_description": job_description,
            "company_name": None,
            "role_name": None,
            "inferred_rounds": [],
            "generated_tests": [],
            "errors": []
        }
        
        # Invoke the graph
        result = graph.invoke(initial_state)
        
        if result.get("errors"):
            print("Errors encountered:", result["errors"])
            
        return result["generated_tests"]
        
    except Exception as e:
        print(f"Critical Error: {e}")
        return []

if __name__ == "__main__":
    # Example JDs
    
    swe_jd = """
    EverUptime Intern with PPO Campus Drive for B.Tech (CSE,IT,IOT,AI&ML,DS,ECE,EEE) 2026 batch students for Software Engineer Intern | CTC: 8.00 LPA.

About EverUptime

EverUptime is a technology-driven company focused on building reliable, scalable, and high-performance software systems. We build modern platforms that help engineering teams operate production systems efficiently and reliably.

What We Do

* EverUptime is an AI-powered incident management platform that helps DevOps and engineering teams:
* Detect system issues faster using intelligent monitoring
* Automatically triage incidents using AI-driven insights
* Reduce downtime with streamlined incident resolution workflows
* Manage on-call schedules, incident alerts, and status pages — all from a single integrated platform
* Our products are built using modern backend systems, cloud-native architectures, and AI-driven workflows to solve real-world reliability challenges.

Role: Software Engineer – Intern

Internship Duration: 6 Months

Key Responsibilities:

* Work on real-time software development projects
* Collaborate with senior engineers and product teams
* Design, develop, test, and maintain application features
* Gain hands-on exposure to backend systems, cloud platforms, and scalable architectures

What’s in It for You

* Students selected for this role will gain a strong foundation in real-world software engineering, including:
* Opportunity to build a production-grade AI product from the ground up
* Work closely with the founding team and be part of EverUptime’s early-stage journey
* Exposure to building systems that support mission-critical domains such as banking, healthcare, travel, and enterprise platforms
* Learn how to design resilient, fault-tolerant systems that operate 24/7 with high availability
* Hands-on experience with scalability, reliability engineering, and modern development practices

Compensation & Career Progression

* Internship Stipend: ₹25,000 per month (for 6 months)
* Full-Time Offer (Post Internship): ₹8 LPA CTC upon successful conversion based on performance

* Eligibility Criteria
* Degree: B.Tech – CSE,IT,IOT,AI&ML,DS,ECE,EEE
* Batch: 2026 Pass-out
* Strong interest in software engineering and programming

Shortlisting Criteria

* We are looking for students with strong programming fundamentals and problem-solving skills.
* Good understanding of data structures and algorithms
* Hands-on coding experience
* Competitive programming profiles (such as LeetCode, CodeChef, Codeforces, etc.) are good to have, but not mandatory

Selection Process

The recruitment process will consist of the following stages:

Programming Test

* System Design / System Test
* Technical Interview – I
* Technical Interview – II
* Managerial (MR) Round
    """

    bpo_jd = """
TTEC Campus Drive – 2026 Batch

Eligible Courses: B.Tech (All Branches), MBA, MCA

* Package: ₹3.48 / ₹3.60 LPA

* Employee benefits

* Attractive incentive schemes

* Night shift allowance.

About TTEC

Our business is about making customers happy. That’s all we do. Since 1982, we’ve helped companies build engaged, pleased, profitable customer experiences powered by our combination of humanity and technology. On behalf of many of the world’s leading iconic and disruptive brands, we talk, message, text, and video chat with millions of customers every day. Learn more about our company values, our Environmental, Social, and Governance ("ESG"), and how we support gender diversity, including through a leadership program that empowers the women of TTEC. Visit www.ttec.com to know more about the organization.

Our Opportunities

We provide excellent career growth opportunities to the Fresher/Experienced candidates with excellent English communication skills (Verbal & Written) who want to make a career in the BPO industry. We are particularly proud of this opportunity which we offer to whoever joins us, and there are a lot of passionate individuals who have made the most of this opportunity and are still associated with us as a part of our senior leadership team. We have an open, diverse and growth-oriented culture and offers:

* 100% Legally Compliant to all State & Central laws
* Competitive Salary & Benefits
* Employee centric Human Resource Policies
* Fast career growth in Operations & Support functions
* Flat Organization structure & Open Door Policy
* Employee Development plans
* Fun @ Work & lot of Employee Engagement & Corporate Social Responsibility programs

What makes TTEC tick?

A lot of things go into making our distinctive flavor, but we’re talking about one specific ingredient today – our zest for life. Living life with enthusiasm is just part of who we are. And we do it together, no matter where we’re located. We enjoy what we do, care about who we work with and take every chance to have fun after a hard day’s work. Our vibrancy is a big part of our tradition and our future.

We hire about 200 candidates every month including fresh graduates/MBA/B.E./B. Tech/B.A./B.Com as Chat Customer Service Representatives for TTEC - Ahmedabad, Gujarat location. In addition to local candidates, our workforce consists of people who have relocated to join us from across India.

We hire individuals for our non – voice programs from time to time for the following processes:

Chat and Email Customer Service Representative

Our client is the global leader for online shopping, an industry whose existence cannot be ignored. Online shopping has completely changed the way we look at our shopping requirements. The expectations which we have from individuals whom we hire:

* Amazing fluency – written English
* Accurately understand and resolve the customer concerns
* The term “customer” would describe someone who would wish to purchase or sell a product/products/product catalogue/collection on the client website
* Though most customers raise basic concerns which results in a lower turnaround time, there are some wherein sellers would like to understand how they can expand their business and ultimately achieve a higher revenue and profit. This is where a lot of research and analytical skills come into the picture which helps in providing a very satisfactory resolution to sellers – the goal here is to get business on a regular interval from the customers
* Patience – a key aspect of the job. Not all customers are satisfied with a resolution which is provided though it is as per the policies/guidelines laid down by the client. To be able to handle such situations by keeping calm and at the same time convincing the customer about the resolution provided
* Retention – It is very important to be aware of the policies laid down by the client and also be aware of any product updates which come from the client. Effectively, absorbing and retaining content delivered throughout the training period and clear assessments conducted during that particular period
* Flexibility – Individuals should be flexible to work in a 24/7 environment. Though we try our best to provide shifts which are rotating on a monthly basis, however based on the business requirements, they would also be expected to work in consecutive night shifts, say 3-4 months
* Multitasking – It would be expected that 3-4 chats would need to be handled at any given point of time, where the nature of the queries would vary from one another and the resolution needs to be provided without consuming too much time of the customer

Proposed interview process:

The interview process will happen in 2 phases, the first of which would be on campus

* Online application through our career page followed by online assessment
* Online assessment consists of Situational Judgement Test, Personality Assessment, Computer Skills Assessment, Logical Reasoning & Cognitive Ability & English
* Students who clear the Online assessment will qualify for the 2nd phase of interview which will be a written assessment to gauge English written Language
* The 2nd phase would be virtual
* Students qualifying written will have an interaction with the team
* Shortlisted students will be issues a Letter of Intent followed by an Offer Letter

Salary:

Monthly INR 29,000/30,000 CTC (3.48/3.60 Lakhs PA) + Employee Benefits + Attractive incentive schemes + Night Shift Allowance

I have attached the Employee Benefits Sheet for quick reference which includes all other benefits that are being offered on top of the CTC. Request you to confirm back with the alignment of the students and their availability to join us after their final exams. Please note, we would not be able to accommodate any leaves for 90 days after they join."
    """

    print("--- Running SWE Agent Test ---")
    swe_tests = generate_mock_tests_for_jd(swe_jd)
    print(f"Generated {len(swe_tests)} tests for SWE.")
    for t in swe_tests:
        print(f"Test: {t.title} ({t.num_questions} Qs)")
        # Print first question as sample
        if t.questions:
            print(f"  Sample Q: {t.questions[0].problem_statement or t.questions[0].question_text}")

    print("\n--- Running BPO Agent Test ---")
    bpo_tests = generate_mock_tests_for_jd(bpo_jd)
    print(f"Generated {len(bpo_tests)} tests for BPO.")
    for t in bpo_tests:
        print(f"Test: {t.title} ({t.num_questions} Qs)")
