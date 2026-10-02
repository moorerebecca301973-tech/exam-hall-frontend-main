import { Routes, Route, Navigate, Link } from "react-router-dom";
import Landing from "./pages/Landing";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Departments from "./pages/admin/Departments";
import Sessions from "./pages/admin/Sessions";
import Courses from "./pages/admin/Courses";
import Halls from "./pages/admin/Halls";
import Exams from "./pages/admin/Exams";
import StudentsRoster from "./pages/admin/StudentsRoster";
import StudentRegister from "./pages/student/StudentRegister";
import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentSeats from "./pages/student/StudentSeats";
import StudentTimetable from "./pages/student/StudentTimetable";
import AdminLayout from "./components/layout/AdminLayout";
import StudentLayout from "./components/layout/StudentLayout";
import { AdminRoute, StudentRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="departments" element={<Departments />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="courses" element={<Courses />} />
          <Route path="halls" element={<Halls />} />
          <Route path="exams" element={<Exams />} />
          <Route path="students" element={<StudentsRoster />} />
        </Route>
      </Route>

      {/* Student */}
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route element={<StudentRoute />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="seats" element={<StudentSeats />} />
          <Route path="timetable" element={<StudentTimetable />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <p className="text-5xl font-bold text-brand-600">404</p>
      <p className="text-slate-600">This page doesn't exist.</p>
      <Link to="/" className="font-medium text-brand-600 hover:underline">
        &larr; Back home
      </Link>
    </div>
  );
}
