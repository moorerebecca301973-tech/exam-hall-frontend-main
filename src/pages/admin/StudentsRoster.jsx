import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { StudentAPI, DepartmentAPI, SemesterAPI, LEVELS } from "../../lib/api";
import { PageHeader, Spinner, EmptyState } from "../../components/ui/Misc";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

export default function StudentsRoster() {
  const { adminToken } = useAuth();
  const [students, setStudents] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [filters, setFilters] = useState({ department_id: "", level: "", semester_id: "" });

  useEffect(() => {
    Promise.all([DepartmentAPI.list(), SemesterAPI.list(adminToken)]).then(([d, s]) => {
      setDepartments(d);
      setSemesters(s);
    });
  }, [adminToken]);

  useEffect(() => {
    const params = {};
    if (filters.department_id) params.department_id = filters.department_id;
    if (filters.level) params.level = filters.level;
    if (filters.semester_id) params.semester_id = filters.semester_id;
    StudentAPI.roster(adminToken, params).then(setStudents);
  }, [adminToken, filters]);

  const deptById = useMemo(() => Object.fromEntries(departments.map((d) => [d.id, d])), [departments]);
  const semById = useMemo(() => Object.fromEntries(semesters.map((s) => [s.id, s])), [semesters]);

  return (
    <div>
      <PageHeader title="Students" description="Every student who has self-registered, across all departments and levels." />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select className="max-w-[200px]" value={filters.department_id} onChange={(e) => setFilters((f) => ({ ...f, department_id: e.target.value }))}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
        <Select className="max-w-[160px]" value={filters.level} onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value }))}>
          <option value="">All levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </Select>
        <Select className="max-w-[220px]" value={filters.semester_id} onChange={(e) => setFilters((f) => ({ ...f, semester_id: e.target.value }))}>
          <option value="">All semesters</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
          ))}
        </Select>
      </div>

      {!students ? (
        <Spinner />
      ) : students.length === 0 ? (
        <EmptyState icon={Users} title="No students found" description="No student matches these filters yet." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Full name</th>
                <th className="px-5 py-3 font-medium">Matric no.</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Level</th>
                <th className="px-5 py-3 font-medium">Semester</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{s.full_name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{s.matric_no}</td>
                  <td className="px-5 py-3 text-slate-600">{deptById[s.department_id]?.name || s.department_id}</td>
                  <td className="px-5 py-3"><Badge tone="brand">{s.level}</Badge></td>
                  <td className="px-5 py-3 text-slate-600">{semById[s.semester_id]?.name || s.semester_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
