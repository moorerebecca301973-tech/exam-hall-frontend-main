import { Link } from "react-router-dom";
import { ShieldCheck, GraduationCap, ArrowRight, Armchair, CalendarClock, Building2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-900 via-brand-800 to-slate-900 text-white">
      <div className="mx-auto flex max-w-5xl flex-col px-6 py-14 sm:py-20">
        <div className="mb-14 flex items-center gap-2 text-lg font-bold">
          <GraduationCap className="size-7" />
          ExamHall
        </div>

        <div className="max-w-2xl">
          <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-brand-100">
            EXAM SEAT &amp; HALL ALLOCATION SYSTEM
          </p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Every student, the right seat. Every hall, no mix-ups.
          </h1>
          <p className="mt-4 text-base text-brand-100 sm:text-lg">
            Set up departments, courses and exam timetables, mix multiple departments
            into a single hall by matric number range, and let students register once
            to get their seat, hall and a printable personalized timetable.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Link
            to="/admin/login"
            className="group flex flex-col justify-between rounded-2xl bg-white p-6 text-slate-900 shadow-xl transition-transform hover:-translate-y-0.5"
          >
            <div>
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <ShieldCheck className="size-6" />
              </div>
              <h2 className="text-lg font-bold">Administrator</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage departments, semesters, courses, halls and exam hall allocation.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-brand-700">
              Continue as admin
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            to="/student/register"
            className="group flex flex-col justify-between rounded-2xl bg-white p-6 text-slate-900 shadow-xl transition-transform hover:-translate-y-0.5"
          >
            <div>
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                <GraduationCap className="size-6" />
              </div>
              <h2 className="text-lg font-bold">Student</h2>
              <p className="mt-1 text-sm text-slate-500">
                Register with your matric number to get your seat, hall and timetable.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-accent-700">
              Continue as student
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        <div className="mt-16 grid gap-6 border-t border-white/10 pt-10 sm:grid-cols-3">
          <Feature
            icon={Building2}
            title="Mix departments in one hall"
            text="Assign matric-number ranges from two or more departments to seat blocks in the same hall."
          />
          <Feature
            icon={CalendarClock}
            title="A real exam timetable"
            text="Schedule date and time per course, mark exams completed, and lock a semester once it's over."
          />
          <Feature
            icon={Armchair}
            title="Printable personal timetable"
            text="Students see their auto-allocated courses, seat number and hall, ready to print."
          />
        </div>

        <p className="mt-16 text-center text-xs text-brand-200">
          Moshood Abiola Polytechnic &middot; Department of Computer Science
        </p>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div>
      <Icon className="mb-3 size-5 text-brand-300" />
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-brand-200">{text}</p>
    </div>
  );
}
