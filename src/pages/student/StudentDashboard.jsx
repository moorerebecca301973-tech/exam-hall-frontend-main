import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { StudentAPI } from "../../lib/api";
import { PageHeader, Spinner, EmptyState, StatCard } from "../../components/ui/Misc";
import { Card } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function StudentDashboard() {
  const { studentToken, student } = useAuth();
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    StudentAPI.myCourses(studentToken).then(setCourses);
  }, [studentToken]);

  const totalUnits = courses?.reduce((sum, c) => sum + (c.unit || 0), 0) || 0;

  return (
    <div>
      <PageHeader
        title={`Hi, ${student?.full_name?.split(" ")[0] || "there"}`}
        description="Courses auto-allocated to you based on your department, level and semester."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Registered courses" value={courses?.length ?? "-"} icon={BookOpen} tone="accent" />
        <StatCard label="Total units" value={totalUnits || "-"} icon={BookOpen} tone="brand" />
      </div>

      {!courses ? (
        <Spinner />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses allocated yet"
          description="Your administrator hasn't linked any courses to your department/level/semester yet. Check back soon."
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Level</th>
                <th className="px-5 py-3 font-medium">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c) => (
                <tr key={c.course_offering_id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{c.course_code}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{c.course_title}</td>
                  <td className="px-5 py-3"><Badge tone="brand">{c.level}</Badge></td>
                  <td className="px-5 py-3 text-slate-600">{c.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
