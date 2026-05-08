# Schedulix - College Timetable Management System

Schedulix is a full-stack college timetable generator and management system. It uses a MERN stack along with Python and Google OR-Tools to automatically generate schedules that avoid teacher and room overlaps, while broadcasting updates to connected clients in real-time.

## Features

### Constraint Solving Engine
* **Algorithm**: Uses Google OR-Tools (CP-SAT solver) in Python, integrating with the Node.js backend via `child_process`.
* **Conflict Prevention**: Prevents overlapping rooms or teachers across different departments.
* **Break Handling**: Allocates break slots and distributes academic workloads evenly based on facility availability.

### Admin Dashboard
* **Access Control**: Role-based routing secured with JWT authentication.
* **Data Management**: CRUD interface for managing Teachers, Subjects, Rooms, and Users.
* **Schedule Generation**: Triggers background schedule generation, with UI validation for incomplete datasets.
* **Interactive Timetable**: Drag-and-drop interface for admins to manually adjust class blocks on the grid.
* **Management**: Search and delete existing timetables globally.

### Real-time Updates
* **WebSockets**: Uses Socket.io for live bi-directional communication.
* **Auto-Sync**: When an admin updates a schedule, the server pushes events to connected clients, invalidating their React Query caches to refresh the UI without a page reload.

### Student Portal
* **Public Access**: Open portal for students to search schedules by department, semester, and section.
* **State Persistence**: Uses `sessionStorage` to keep search queries active across page reloads.

### Faculty Dashboard
* **Personalized View**: Teachers have a secure login to view their specific schedules.
* **Aggregated Data**: Automatically filters and displays the teacher's schedule across all assigned departments and semesters.

### Frontend Architecture
* **Data Fetching**: Uses React Query v5 for caching, background refetching, and managing loading states.
* **PDF Export**: Users can download schedules as PDFs using `jsPDF` and `html2canvas` on the client side.
* **UI**: Built with TailwindCSS for responsive design.

### Database
* **Schema Design**: Mongoose schemas with normalized references connecting Timetables to discrete Subjects, Rooms, and Teachers.
* **Data Integrity**: Fallback validation logic handles cases where referenced entities (like a Teacher or Room) are deleted, preventing frontend crashes.

---

## Tech Stack
* **Frontend**: React.js, TailwindCSS, React Query v5, Socket.io-client, React Router Dom
* **Backend**: Node.js, Express.js, MongoDB + Mongoose, Socket.io
* **Algorithm Engine**: Python 3, Google OR-Tools (`cp_model`)

## Local Installation

1. Clone the repository.
2. Create a `.env` file in the `backend/` directory:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
PYTHON_PATH=python
