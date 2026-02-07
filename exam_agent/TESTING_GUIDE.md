# Exam Agent Testing Scenarios

Use the following prompts to test the capabilities of the Exam Agent with the demo user.

## Prerequisites
1. **Backend Running**: Ensure `fast_api_server.py` is running.
2. **Frontend Running**: Ensure `npm run dev` is active.
3. **Demo Login**:
   - **Email**: `demo@campus.com`
   - **Password**: `password`

## Test Scenarios

### 1. Full Schedule Generation (Happy Path)
**Goal**: Verify the agent can successfully schedule all seeded exams and allocate seats.

**Prompt**:
> "Schedule all upcoming exams for the BTech and MTech programs."

**Expected Result**:
- **Status**: `complete` (Green Check).
- **Timetable**: Lists exams like CS101, AI101, etc., with valid dates/times.
- **Seat Map**: 
  - Select "CS101" or "CS201".
  - Halls like "Hall 101" should show blue seats.
  - Student IDs (e.g., `BT21CSE001`) should be displayed on the seats.

### 2. Visual Layout Verification
**Goal**: Confirm that the new explicit Row/Column input for halls is working in the visualizer.

**Prompt**:
> "Generate seating arrangement."

**Expected Result**:
- Go to the **Seat Map** tab.
- Look at the header for each hall (e.g., "Hall 101").
- **Verification**:
  - It should display the layout dimension (e.g., "10x6 Layout").
  - The grid should visually match this dimension (10 rows, 6 columns).
  - Verify "Auditorium" (if seeded/present) has a larger grid (e.g., 20x10).

### 3. Conflict Detection
**Goal**: See how the agent reports issues if the LLM generates overlapping times for students.

**Prompt**:
> "Create an aggressive exam schedule."

*(Note: The LLM tries to avoid conflicts, so you might not always see them unless the schedule is very tight, but the UI handles them.)*

**Expected Result**:
- If the generated timetable assigns two exams for the same student overlap (e.g., CS101 and CS201 at the same time), the **Conflicts** card will turn Red/Orange.
- A list of conflicts will appear (e.g., "Student X has double booking...").

### 4. Data Persistence Check
**Goal**: Verify that new data entered via the UI is respected by the agent.

**Steps**:
1. Go to **Campus Map -> View Structures**.
2. Click **Summon Structure** and add a new Hall (e.g., ID: `999`, Name: `Testing Room`, Rows: `5`, Cols: `5`).
3. Return to **Exam Agent**.
4. Run Prompt: > "Re-schedule everything including the new testing room."

**Expected Result**:
- The new `Testing Room` should appear in the **Seat Map** visualizations if it was needed/used for allocation.
