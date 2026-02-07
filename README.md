# Campus Agents: Placement Cell & Exam Scheduling System

An AI-powered application that automates interview preparation materials and manages campus exam scheduling with intelligent seat allocation.

![Placement Cell Agent](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop)

## 🚀 Features

### Placement Cell Agent
- **Intelligent Parsing**: Extracts company info, roles, and explicit interview rounds from JDs.
- **Web Research Agent**: Automatically searches the web for company-specific interview patterns if the JD is vague.
- **Round Inference**: Determines the optimal interview rounds (e.g., Coding, Aptitude, System Design).
- **Mock Test Generation**: Generates specific questions (MCQs, Coding) for each round.

### Exam Scheduling Agent
- **Smart Scheduling**: Automatically schedules exams based on available halls and student enrollments.
- **Seat Allocation**: Intelligent seat allocation to prevent conflicts.
- **Multi-Workspace Support**: Manage multiple campuses/institutions with separate workspaces.
- **Complete CRUD Operations**: Manage buildings, halls, departments, programs, courses, exams, and students.

### Campus Management System
- **Organization Management**: Departments and Programs with full CRUD operations.
- **Building & Hall Management**: Track campus infrastructure with capacity management.
- **Student Management**: 
  - Add students manually or bulk import via Excel
  - Smart course filtering based on department and program
  - Track enrolled courses per student
- **Course & Exam Management**: Link courses to departments and programs.
- **User Authentication**: Secure login with workspace-based access control.
- **Team Collaboration**: Invite team members to workspaces via email.

### Premium UI
- Beautiful, glassmorphism-styled React interface
- Responsive design for all devices
- Intuitive navigation with tabbed interface
- Real-time feedback with toast notifications

## 🛠️ Tech Stack

- **Agent**: LangGraph, LangChain
- **LLMs**: Groq (Llama 3 / Mixtral), Google Gemini
- **Backend**: FastAPI, Python 3.9+
- **Database**: MongoDB (Motor for async operations)
- **Frontend**: React, Vite, TailwindCSS (for utilities), Vanilla CSS (for styling)
- **Search**: Tavily / DuckDuckGo
- **Authentication**: JWT with bcrypt password hashing
- **File Processing**: Pandas, OpenPyXL for Excel imports

## 📋 Prerequisites

- Python 3.9+
- Node.js 16+
- MongoDB (local or Atlas)
- API Keys:
  - **Groq API Key**: For the core LLM reasoning.
  - **Tavily API Key**: For web research agent.

## ⚙️ Installation

### 1. Clone & Configure

```bash
# Clone the repository (if not already done)
# cd Campus-Agents

# Create .env file
cp .env.example .env
```

Open `.env` and add your keys:

```env
GROQ_API_KEY=your_key_here
TAVILY_API_KEY=your_key_here
MONGODB_URI=mongodb://localhost:27017
```

### 2. Backend Setup

```bash
# Install dependencies
pip install -r requirements.txt

# (Optional) Seed mock data for demo user
python3 seed_mock_data.py

# (Optional) Fix path if you have import issues
export PYTHONPATH=$PYTHONPATH:$(pwd)
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## 🏃♂️ Usage

### Start the Backend

From the root directory:

```bash
python3 -m uvicorn fast_api_server:app --reload --port 8000
```

Server will run at `http://localhost:8000`.

### Start the Frontend

From the `frontend` directory:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Demo Account

After running the seed script, you can login with:
- **Email**: demo@campus.com
- **Password**: password

The demo account includes:
- 4 Programs (B.Tech, M.Tech, MCA, BBA)
- 6 Departments (CSE, AIML, ECE, ME, IT, MBA)
- 3 Buildings with 6 Halls
- 15 Courses across different programs
- 9 Exams
- 13 Students with course enrollments

## 💡 How it Works

### Placement Cell Agent
1.  **Paste a JD**: Copy any text from a job posting (LinkedIn, Career Page, etc.).
2.  **Analyze**: The agent parses the text and decides if it needs to search the web for more info.
3.  **Plan**: It proposes a set of interview rounds (e.g., "Round 1: Online Assessment", "Round 2: Technical Interview").
4.  **Generate**: It creates concrete mock test questions for each round.

### Exam Scheduling Agent
1.  **Setup**: Configure your campus infrastructure (buildings, halls, departments, programs).
2.  **Add Data**: Add courses, exams, and students (manually or via Excel import).
3.  **Schedule**: The agent automatically schedules exams and allocates seats.
4.  **Manage**: View and manage all schedules, handle conflicts, and make adjustments.

## 📊 Data Management

### Student Import via Excel

You can bulk import students using Excel files. Required columns:
- `id`: Student roll number
- `name`: Student name
- `department_id`: Department code (e.g., CSE)
- `program`: Program code (e.g., BTECH) - optional
- `enrolled_courses`: Comma-separated course codes - optional

Download the template from the Students tab for the correct format.

## 🔐 Security Features

- JWT-based authentication
- Bcrypt password hashing
- Workspace-based access control
- Protected API endpoints
- CORS configuration for secure cross-origin requests

## 🏗️ Architecture

### Backend Structure
```
├── fast_api_server.py      # Main FastAPI application
├── db.py                   # MongoDB operations
├── auth_utils.py           # Authentication utilities
├── email_utils.py          # Email sending utilities
├── placement_cell_agent/   # Placement agent logic
│   ├── graph.py
│   └── models.py
└── exam_agent/             # Exam scheduling agent
    ├── graph.py
    └── models.py
```

### Frontend Structure
```
frontend/src/
├── components/
│   ├── WorkspaceManager.jsx      # Main workspace container
│   ├── BuildingsView.jsx         # Campus map management
│   ├── AcademicManager.jsx       # Courses & exams
│   ├── StudentsManager.jsx       # Student management
│   ├── OrganizationManager.jsx   # Departments & programs
│   └── ExamAgentView.jsx         # Exam scheduling
├── context/
│   ├── AuthContext.jsx           # Authentication state
│   └── ToastContext.jsx          # Notifications
└── App.jsx
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.
