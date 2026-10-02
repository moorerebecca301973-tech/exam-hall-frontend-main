# ExamHall — Frontend (React + Vite)

A React (Vite) frontend for the Exam Seat & Hall Allocation System, built to match the
FastAPI backend one-to-one: departments, sessions/semesters, courses & offerings, halls,
exam timetable + hall allocation (mixing departments by matric number range), and the
student registration / seat lookup / printable timetable flow.

Styled with Tailwind CSS v4. No backend code lives here — set `VITE_API_URL` to point at
your deployed FastAPI backend (e.g. on Render).

## 1. Local development

```bash
npm install
cp .env.example .env.local     # then edit VITE_API_URL if your backend isn't on :8000
npm run dev
```

Opens at **http://localhost:5173**. It expects the backend (see the backend's own
README) running and reachable at `VITE_API_URL`.

## 2. Deploying to Vercel

1. Push this folder to a Git repo (or import it directly - Vercel also supports
   monorepos with a "Root Directory" setting if it lives alongside the backend).
2. In Vercel: **New Project** → import the repo → set **Root Directory** to this
   folder (`exam-hall-frontend`) if it's part of a monorepo.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`,
   output directory `dist` (defaults are already correct).
4. Add an environment variable:
   - `VITE_API_URL` = the URL of your deployed backend, e.g.
     `https://exam-hall-allocator-api.onrender.com` (no trailing slash).
5. Deploy. `vercel.json` in this folder already rewrites all routes to `index.html`
   so client-side routing (React Router) works on refresh/deep links.
6. Once deployed, copy your Vercel URL and set it as `ALLOWED_ORIGINS` on the backend
   (see the backend README) so the browser isn't blocked by CORS.

## 3. What's in here

```
src/
  lib/api.js               Axios client + one function per backend endpoint
  context/AuthContext.jsx  Separate admin/student sessions (JWT in localStorage)
  components/
    ui/                    Button, Card, Badge, Input/Select, Modal, Spinner, etc.
    layout/                AdminLayout (sidebar), StudentLayout (topbar+tabs)
    ProtectedRoute.jsx     AdminRoute / StudentRoute guards
  pages/
    Landing.jsx             Role picker (admin / student)
    admin/                  Login, Dashboard, Departments, Sessions, Courses,
                            Halls, Exams (timetable + hall allocation), Students
    student/                Register, Login, Dashboard (courses), Seats, Timetable (print)
```

### Design notes

- Two accent colors: **indigo** (`brand-*`) for the admin side, **teal** (`accent-*`)
  for the student side - makes it obvious which "mode" you're in at a glance.
- The exam timetable + hall allocation screen (`pages/admin/Exams.jsx` +
  `HallAllocationModal.jsx`) is the most involved piece: a hall allocation is one
  hall booked for one date/time *sitting*, and each "department block" inside it can
  point at a **different** course/department that happens to be examined at the same
  time - mirroring how the backend models mixed-department halls.
- The student timetable page (`pages/student/StudentTimetable.jsx`) uses a
  `data-print-area` wrapper + print-only CSS (in `index.css`) so "Print timetable"
  produces a clean printout with the app chrome (sidebar, nav, buttons) hidden.
- No component library - a small hand-rolled `components/ui/` set keeps the bundle
  light and the look consistent.

## 4. Connecting to a different backend later

Everything routes through `src/lib/api.js`'s `API_URL` constant
(`import.meta.env.VITE_API_URL`). To point at a different backend, just change the
`VITE_API_URL` environment variable in Vercel (Project Settings → Environment
Variables) and redeploy - no code changes needed.
