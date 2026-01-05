# Campus Agents: Placement Cell Agent

An AI-powered application that automates the creation of role-specific interview preparation materials. It transforms Job Descriptions (JDs) into structured interview plans and generates mock tests tailored to the role.

![Placement Cell Agent](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop)

## 🚀 Features

- **Intelligent Parsing**: Extracts company info, roles, and explicit interview rounds from JDs.
- **Web Research Agent**: Automatically searches the web for company-specific interview patterns if the JD is vague.
- **Round Inference**: Determines the optimal interview rounds (e.g., Coding, Aptitude, System Design).
- **Mock Test Generation**: Generates specific questions (MCQs, Coding) for each round.
- **Premium UI**: A beautiful, glassmorphism-styled React interface for easy interaction.

## 🛠️ Tech Stack

- **Agent**: LangGraph, LangChain
- **LLMs**: Groq (Llama 3 / Mixtral), Google Gemini
- **Backend**: FastAPI, Python 3.9+
- **Frontend**: React, Vite, TailwindCSS (for utilities), Vanilla CSS (for styling)
- **Search**: Tavily / DuckDuckGo

## 📋 Prerequisites

- Python 3.9+
- Node.js 16+
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
```

### 2. Backend Setup

```bash
# Install dependencies
pip install -r requirements.txt
pip install fastapi uvicorn

# (Optional) Fix path if you have import issues
export PYTHONPATH=$PYTHONPATH:$(pwd)
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## 🏃‍♂️ Usage

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

## 💡 How it Works

1.  **Paste a JD**: Copy any text from a job posting (LinkedIn, Career Page, etc.).
2.  **Analyze**: The agent parses the text and decides if it needs to search the web for more info.
3.  **Plan**: It proposes a set of interview rounds (e.g., "Round 1: Online Assessment", "Round 2: Technical Interview").
4.  **Generate**: It creates concrete mock test questions for each round.
