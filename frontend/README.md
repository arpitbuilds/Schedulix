# Where is My TimeTable — Frontend (React + Vite)

This frontend is built **specifically** for the backend routes found in your zip:

- `POST /api/auth/login`
- Admin (JWT, role=admin): `/api/admin/*` + `/api/timetable/*`
- Faculty (JWT, role=faculty/admin): `/api/faculty/*` + `/api/timetable/teacher/:teacherId`
- Student (public): `GET /api/timetable/student`

## 1) Setup

```bash
cd where-is-my-timetable-frontend
npm install
cp .env.example .env
```

Update `.env` if your backend runs on a different port:

```
VITE_API_URL=http://localhost:5001
```

## 2) Run

```bash
npm run dev
```

Frontend: http://localhost:5173

## 3) Backend CORS

Your backend uses:

```js
cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true })
```

So backend `.env` should include:

```
FRONTEND_URL=http://localhost:5173
```

## Notes

- Admin CRUD screens: Teachers / Subjects / Rooms / Constraints
- Timetable: Generate + Lookup + Edit entry
- Faculty dashboard expects a **teacherId** (because backend doesn't expose a teachers list to faculty).
