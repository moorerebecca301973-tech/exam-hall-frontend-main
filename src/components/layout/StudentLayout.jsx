import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, BookOpen, Armchair, CalendarDays } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/student/dashboard", label: "My Courses", icon: BookOpen },
  { to: "/student/seats", label: "Seat & Hall", icon: Armchair },
  { to: "/student/timetable", label: "Timetable", icon: CalendarDays },
];

export default function StudentLayout() {
  const { student, clearStudentSession } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    clearStudentSession();
    navigate("/student/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 font-bold text-accent-700">
            <GraduationCap className="size-6" />
            <span>ExamHall</span>
            <span className="hidden text-sm font-normal text-slate-400 sm:inline">| Student Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">{student?.full_name}</p>
              <p className="text-xs text-slate-500">{student?.matric_no}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-4 sm:px-6">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-accent-600 text-accent-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
