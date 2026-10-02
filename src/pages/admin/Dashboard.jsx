import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, DoorOpen, ClipboardList, Users, CalendarRange, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  DepartmentAPI,
  HallAPI,
  ExamAPI,
  StudentAPI,
  SemesterAPI,
} from "../../lib/api";
import { PageHeader, StatCard, Spinner } from "../../components/ui/Misc";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Badge, { semesterStatusTone, examStatusTone } from "../../components/ui/Badge";

export default function Dashboard() {
  const { adminToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [departments, halls, exams, students, semesters] = await Promise.all([
        DepartmentAPI.list(),
        HallAPI.list(),
        ExamAPI.list(),
        StudentAPI.roster(adminToken),
        SemesterAPI.list(adminToken),
      ]);
      if (!mounted) return;
      setData({ departments, halls, exams, students, semesters });
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [adminToken]);

  if (loading || !data) return <Spinner label="Loading dashboard..." />;

  const activeSemester = data.semesters.find((s) => s.status === "active");
  const upcomingExams = [...data.exams]
    .filter((e) => e.status === "scheduled")
    .sort((a, b) => `${a.exam_date}${a.start_time}`.localeCompare(`${b.exam_date}${b.start_time}`))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of departments, halls, exams and student registrations."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Departments" value={data.departments.length} icon={Building2} tone="brand" />
        <StatCard label="Halls" value={data.halls.length} icon={DoorOpen} tone="accent" />
        <StatCard label="Exams scheduled" value={data.exams.length} icon={ClipboardList} tone="amber" />
        <StatCard label="Students registered" value={data.students.length} icon={Users} tone="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Upcoming exams"
            description="Next scheduled sittings across all departments"
            action={
              <Link to="/admin/exams" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
                Manage <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <CardBody>
            {upcomingExams.length === 0 ? (
              <p className="text-sm text-slate-500">No exams scheduled yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingExams.map((exam) => (
                  <li key={exam.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{exam.exam_date}</p>
                      <p className="text-slate-500">
                        {exam.start_time?.slice(0, 5)} - {exam.end_time?.slice(0, 5)}
                      </p>
                    </div>
                    <Badge tone={examStatusTone(exam.status)}>{exam.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Current semester"
            action={
              <Link to="/admin/sessions" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
                Manage <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <CardBody>
            {activeSemester ? (
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <CalendarRange className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{activeSemester.name} semester</p>
                  <Badge tone={semesterStatusTone(activeSemester.status)}>{activeSemester.status}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No active semester. Start one from Sessions &amp; Semesters so students can register.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
