import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  CalendarRange,
  BookOpen,
  DoorOpen,
  ClipboardList,
  Users,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/departments", label: "Departments", icon: Building2 },
  { to: "/admin/sessions", label: "Sessions & Semesters", icon: CalendarRange },
  { to: "/admin/courses", label: "Courses & Offerings", icon: BookOpen },
  { to: "/admin/halls", label: "Halls", icon: DoorOpen },
  { to: "/admin/exams", label: "Exam Timetable & Allocation", icon: ClipboardList },
  { to: "/admin/students", label: "Students", icon: Users },
];

export default function AdminLayout() {
  const { admin, clearAdminSession } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    clearAdminSession();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 font-bold text-brand-700">
          <GraduationCap className="size-5" />
          ExamHall Admin
        </div>
        <button onClick={() => setOpen(true)} className="rounded-md p-1.5 hover:bg-slate-100">
          <Menu className="size-5" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-2 font-bold text-brand-700">
              <GraduationCap className="size-6" />
              <span>ExamHall</span>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-slate-100 lg:hidden">
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-3">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                  )
                }
              >
                <Icon className="size-4.5 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="absolute inset-x-0 bottom-0 border-t border-slate-100 p-4">
            <div className="mb-2 truncate text-sm font-medium text-slate-700">
              {admin?.username}
            </div>
            <div className="mb-3 text-xs uppercase tracking-wide text-slate-400">
              {admin?.role}
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        </aside>

        {open && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="min-h-screen flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
