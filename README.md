# Schedulix — Smart College Timetable Management System

Schedulix is a full-stack, AI-assisted college timetable generator and management portal. It utilizes a powerful MERN stack architecture integrated with Python-driven constraint solving (OR-Tools) to automatically generate optimal academic schedules that prevent teacher overlaps and respect availability constraints.

## 🚀 Key Features
* **AI-Assisted Scheduling**: Generates conflict-free timetables automatically using Google OR-Tools in Python.
* **Real-time Synchronization**: Powered by Socket.io, Student and Faculty portals instantly auto-refresh whenever an Admin publishes a new version of the timetable. No manual reloading required.
* **Multi-Portal Access Control (JWT)**: Secure Admin and Faculty dashboards, alongside an open, public-facing portal for Students to instantly check their specific class schedules.
* **Client-Side PDF Exports**: Offline Timetable exporting built using `jsPDF` and `html2canvas`, keeping server costs at absolute zero while rendering beautiful high-res grids.
* **Silent Background Caching**: Built using `React Query v5` for highly aggressive request caching, cache invalidation, and UI stability.
* **Premium Dashboard UI**: Component-based Glassmorphism styling natively integrated through pure CSS and styled React components.

## 💻 Tech Stack
* **Frontend**: React.js, TailwindCSS, React Query v5, Socket.io-client, React Router
* **Backend**: Node.js, Express.js, MongoDB + Mongoose, Socket.io
* **Algorithm**: Python 3, Google OR-Tools (`cp_model`)

## 🛠 Local Installation

1. Clone this repository.
2. Provide a `.env` in the `backend/` folder:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
PYTHON_PATH=python
```
3. Provide a `.env` in the `frontend/` folder:
```env
VITE_API_URL=http://localhost:5001
```
4. Install dependencies:
```bash
cd backend && npm install
pip install -r requirements.txt
cd ../frontend && npm install
```
5. **(Optional)** Seed the database with dummy initial data: `cd backend && node seed.js`
6. Run both development servers: `cd backend && npm run dev` / `cd frontend && npm run dev`.

## ✨ Portfolio Highlights
This project was architected strictly following professional, modern engineering standards. It eliminates "Ghost References" inherently found in Non-Relational Databases by employing cascading WebSocket cache validation, allowing hundreds of concurrent students to receive live schedule adjustments without crashing the backend pool.
