import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "campus_agent_db"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_data():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]
    
    # Create demo user
    demo_email = "demo@campus.com"
    existing_user = await db.users.find_one({"email": demo_email})
    
    if existing_user:
        user_id = str(existing_user["_id"])
        print(f"Demo user already exists: {user_id}")
    else:
        user_result = await db.users.insert_one({
            "email": demo_email,
            "full_name": "Demo User",
            "password_hash": pwd_context.hash("password")
        })
        user_id = str(user_result.inserted_id)
        print(f"Created demo user: {user_id}")
    
    # Create workspace
    existing_workspace = await db.workspaces.find_one({"owner_id": user_id})
    
    if existing_workspace:
        workspace_id = str(existing_workspace["_id"])
        print(f"Workspace already exists: {workspace_id}")
    else:
        workspace_result = await db.workspaces.insert_one({
            "name": "Demo Campus",
            "owner_id": user_id,
            "members": [user_id]
        })
        workspace_id = str(workspace_result.inserted_id)
        print(f"Created workspace: {workspace_id}")
    
    # Clear existing data for this workspace
    await db.programs.delete_many({"workspace_id": workspace_id})
    await db.departments.delete_many({"workspace_id": workspace_id})
    await db.buildings.delete_many({"workspace_id": workspace_id})
    await db.halls.delete_many({"workspace_id": workspace_id})
    await db.courses.delete_many({"workspace_id": workspace_id})
    await db.exams.delete_many({"workspace_id": workspace_id})
    await db.students.delete_many({"workspace_id": workspace_id})
    
    # Programs
    programs = [
        {"code": "BTECH", "name": "Bachelor of Technology", "workspace_id": workspace_id},
        {"code": "MTECH", "name": "Master of Technology", "workspace_id": workspace_id},
        {"code": "MCA", "name": "Master of Computer Applications", "workspace_id": workspace_id},
        {"code": "BBA", "name": "Bachelor of Business Administration", "workspace_id": workspace_id}
    ]
    await db.programs.insert_many(programs)
    print(f"Created {len(programs)} programs")
    
    # Departments
    departments = [
        {"id": "CSE", "name": "Computer Science and Engineering", "workspace_id": workspace_id},
        {"id": "AIML", "name": "Artificial Intelligence and Machine Learning", "workspace_id": workspace_id},
        {"id": "ECE", "name": "Electronics and Communication Engineering", "workspace_id": workspace_id},
        {"id": "ME", "name": "Mechanical Engineering", "workspace_id": workspace_id},
        {"id": "IT", "name": "Information Technology", "workspace_id": workspace_id},
        {"id": "MBA", "name": "Management Studies", "workspace_id": workspace_id}
    ]
    await db.departments.insert_many(departments)
    print(f"Created {len(departments)} departments")
    
    # Buildings
    buildings = [
        {"id": "AB", "name": "Academic Block A", "workspace_id": workspace_id},
        {"id": "BB", "name": "Academic Block B", "workspace_id": workspace_id},
        {"id": "LH", "name": "Lecture Hall Complex", "workspace_id": workspace_id}
    ]
    await db.buildings.insert_many(buildings)
    print(f"Created {len(buildings)} buildings")
    
    # Halls
    halls = [
        {"id": "101", "name": "Hall 101", "capacity": 60, "rows": 10, "columns": 6, "building_id": "AB", "workspace_id": workspace_id},
        {"id": "102", "name": "Hall 102", "capacity": 60, "rows": 10, "columns": 6, "building_id": "AB", "workspace_id": workspace_id},
        {"id": "201", "name": "Hall 201", "capacity": 80, "rows": 10, "columns": 8, "building_id": "AB", "workspace_id": workspace_id},
        {"id": "101", "name": "Hall 101", "capacity": 100, "rows": 10, "columns": 10, "building_id": "BB", "workspace_id": workspace_id},
        {"id": "102", "name": "Hall 102", "capacity": 100, "rows": 10, "columns": 10, "building_id": "BB", "workspace_id": workspace_id},
        {"id": "301", "name": "Auditorium", "capacity": 200, "rows": 20, "columns": 10, "building_id": "LH", "workspace_id": workspace_id}
    ]
    await db.halls.insert_many(halls)
    print(f"Created {len(halls)} halls")
    
    # Courses
    courses = [
        # B.Tech CSE
        {"code": "CS101", "name": "Introduction to Programming", "department_id": "CSE", "program_code": "BTECH", "workspace_id": workspace_id},
        {"code": "CS201", "name": "Data Structures and Algorithms", "department_id": "CSE", "program_code": "BTECH", "workspace_id": workspace_id},
        {"code": "CS301", "name": "Database Management Systems", "department_id": "CSE", "program_code": "BTECH", "workspace_id": workspace_id},
        {"code": "CS401", "name": "Operating Systems", "department_id": "CSE", "program_code": "BTECH", "workspace_id": workspace_id},
        
        # B.Tech AIML
        {"code": "AI101", "name": "Introduction to AI", "department_id": "AIML", "program_code": "BTECH", "workspace_id": workspace_id},
        {"code": "AI201", "name": "Machine Learning", "department_id": "AIML", "program_code": "BTECH", "workspace_id": workspace_id},
        {"code": "AI301", "name": "Deep Learning", "department_id": "AIML", "program_code": "BTECH", "workspace_id": workspace_id},
        
        # B.Tech ECE
        {"code": "EC101", "name": "Circuit Theory", "department_id": "ECE", "program_code": "BTECH", "workspace_id": workspace_id},
        {"code": "EC201", "name": "Digital Electronics", "department_id": "ECE", "program_code": "BTECH", "workspace_id": workspace_id},
        
        # M.Tech
        {"code": "MT501", "name": "Advanced Algorithms", "department_id": "CSE", "program_code": "MTECH", "workspace_id": workspace_id},
        {"code": "MT502", "name": "Cloud Computing", "department_id": "CSE", "program_code": "MTECH", "workspace_id": workspace_id},
        
        # MCA
        {"code": "MCA101", "name": "Programming in C", "department_id": "IT", "program_code": "MCA", "workspace_id": workspace_id},
        {"code": "MCA201", "name": "Web Technologies", "department_id": "IT", "program_code": "MCA", "workspace_id": workspace_id},
        
        # BBA
        {"code": "BBA101", "name": "Principles of Management", "department_id": "MBA", "program_code": "BBA", "workspace_id": workspace_id},
        {"code": "BBA201", "name": "Marketing Management", "department_id": "MBA", "program_code": "BBA", "workspace_id": workspace_id}
    ]
    await db.courses.insert_many(courses)
    print(f"Created {len(courses)} courses")
    
    # Exams
    exams = [
        {"course_code": "CS101", "course_name": "Programming Midterm", "duration_minutes": 120, "program_code": "BTECH", "workspace_id": workspace_id},
        {"course_code": "CS201", "course_name": "DSA Final Exam", "duration_minutes": 180, "program_code": "BTECH", "workspace_id": workspace_id},
        {"course_code": "CS301", "course_name": "DBMS Midterm", "duration_minutes": 120, "program_code": "BTECH", "workspace_id": workspace_id},
        {"course_code": "AI101", "course_name": "AI Fundamentals Exam", "duration_minutes": 150, "program_code": "BTECH", "workspace_id": workspace_id},
        {"course_code": "AI201", "course_name": "ML Final Exam", "duration_minutes": 180, "program_code": "BTECH", "workspace_id": workspace_id},
        {"course_code": "EC101", "course_name": "Circuit Theory Exam", "duration_minutes": 120, "program_code": "BTECH", "workspace_id": workspace_id},
        {"course_code": "MT501", "course_name": "Advanced Algorithms Exam", "duration_minutes": 180, "program_code": "MTECH", "workspace_id": workspace_id},
        {"course_code": "MCA101", "course_name": "C Programming Exam", "duration_minutes": 120, "program_code": "MCA", "workspace_id": workspace_id},
        {"course_code": "BBA101", "course_name": "Management Principles Exam", "duration_minutes": 120, "program_code": "BBA", "workspace_id": workspace_id}
    ]
    await db.exams.insert_many(exams)
    print(f"Created {len(exams)} exams")
    
    # Students
    students = [
        {"id": "BT21CSE001", "name": "Rahul Sharma", "department_id": "CSE", "program": "BTECH", "enrolled_courses": ["CS101", "CS201", "CS301"], "workspace_id": workspace_id},
        {"id": "BT21CSE002", "name": "Priya Patel", "department_id": "CSE", "program": "BTECH", "enrolled_courses": ["CS101", "CS201"], "workspace_id": workspace_id},
        {"id": "BT21CSE003", "name": "Amit Kumar", "department_id": "CSE", "program": "BTECH", "enrolled_courses": ["CS201", "CS301", "CS401"], "workspace_id": workspace_id},
        {"id": "BT21AIML001", "name": "Sneha Reddy", "department_id": "AIML", "program": "BTECH", "enrolled_courses": ["AI101", "AI201"], "workspace_id": workspace_id},
        {"id": "BT21AIML002", "name": "Vikram Singh", "department_id": "AIML", "program": "BTECH", "enrolled_courses": ["AI101", "AI201", "AI301"], "workspace_id": workspace_id},
        {"id": "BT21ECE001", "name": "Anjali Gupta", "department_id": "ECE", "program": "BTECH", "enrolled_courses": ["EC101", "EC201"], "workspace_id": workspace_id},
        {"id": "BT21ECE002", "name": "Rohan Verma", "department_id": "ECE", "program": "BTECH", "enrolled_courses": ["EC101"], "workspace_id": workspace_id},
        {"id": "MT22CSE001", "name": "Deepak Joshi", "department_id": "CSE", "program": "MTECH", "enrolled_courses": ["MT501", "MT502"], "workspace_id": workspace_id},
        {"id": "MT22CSE002", "name": "Kavita Nair", "department_id": "CSE", "program": "MTECH", "enrolled_courses": ["MT501"], "workspace_id": workspace_id},
        {"id": "MCA22001", "name": "Suresh Rao", "department_id": "IT", "program": "MCA", "enrolled_courses": ["MCA101", "MCA201"], "workspace_id": workspace_id},
        {"id": "MCA22002", "name": "Pooja Desai", "department_id": "IT", "program": "MCA", "enrolled_courses": ["MCA101"], "workspace_id": workspace_id},
        {"id": "BBA21001", "name": "Arjun Mehta", "department_id": "MBA", "program": "BBA", "enrolled_courses": ["BBA101", "BBA201"], "workspace_id": workspace_id},
        {"id": "BBA21002", "name": "Neha Kapoor", "department_id": "MBA", "program": "BBA", "enrolled_courses": ["BBA101"], "workspace_id": workspace_id}
    ]
    await db.students.insert_many(students)
    print(f"Created {len(students)} students")
    
    print("\n✅ Mock data seeded successfully!")
    print(f"Login with: demo@campus.com / password")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
