import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, BookOpen, Link2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  CourseAPI,
  CourseOfferingAPI,
  DepartmentAPI,
  SemesterAPI,
  LEVELS,
  apiErrorMessage,
} from "../../lib/api";
import { PageHeader, Spinner, EmptyState } from "../../components/ui/Misc";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Field, Input, Select } from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

const emptyOffering = {
  mode: "existing", // "existing" | "new"
  course_id: "",
  course_code: "",
  course_title: "",
  course_unit: 2,
  department_id: "",
  level: "ND1",
  semester_id: "",
};

export default function Courses() {
  const { adminToken } = useAuth();
  const [courses, setCourses] = useState(null);
  const [offerings, setOfferings] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [courseModal, setCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ code: "", title: "", unit: 2 });
  const [savingCourse, setSavingCourse] = useState(false);

  const [offeringModal, setOfferingModal] = useState(false);
  const [offeringForm, setOfferingForm] = useState(emptyOffering);
  const [savingOffering, setSavingOffering] = useState(false);

  const load = async () => {
    const [c, o, d, s] = await Promise.all([
      CourseAPI.list(),
      CourseOfferingAPI.list(),
      DepartmentAPI.list(),
      SemesterAPI.list(adminToken),
    ]);
    setCourses(c);
    setOfferings(o);
    setDepartments(d);
    setSemesters(s);
  };

  useEffect(() => {
    load();
  }, []);

  const createCourse = async (e) => {
    e.preventDefault();
    setSavingCourse(true);
    try {
      await CourseAPI.create(adminToken, courseForm);
      toast.success("Course created");
      setCourseModal(false);
      setCourseForm({ code: "", title: "", unit: 2 });
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create course"));
    } finally {
      setSavingCourse(false);
    }
  };

  const openOfferingModal = () => {
    setOfferingForm({
      ...emptyOffering,
      department_id: departments[0]?.id || "",
      semester_id: semesters[0]?.id || "",
    });
    setOfferingModal(true);
  };

  const createOffering = async (e) => {
    e.preventDefault();
    setSavingOffering(true);
    try {
      const payload = {
        department_id: Number(offeringForm.department_id),
        level: offeringForm.level,
        semester_id: Number(offeringForm.semester_id),
      };
      if (offeringForm.mode === "existing") {
        payload.course_id = Number(offeringForm.course_id);
      } else {
        payload.course_code = offeringForm.course_code;
        payload.course_title = offeringForm.course_title;
        payload.course_unit = Number(offeringForm.course_unit) || 2;
      }
      await CourseOfferingAPI.create(adminToken, payload);
      toast.success("Course linked to department/level/semester");
      setOfferingModal(false);
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create course offering"));
    } finally {
      setSavingOffering(false);
    }
  };

  const removeOffering = async (offering) => {
    if (!confirm(`Remove ${offering.course.code} from this department/level/semester?`)) return;
    try {
      await CourseOfferingAPI.remove(adminToken, offering.id);
      toast.success("Offering removed");
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not remove offering"));
    }
  };

  const deptName = (id) => departments.find((d) => d.id === id)?.name || `#${id}`;
  const semLabel = (id) => {
    const s = semesters.find((s) => s.id === id);
    return s ? `${s.name}` : `#${id}`;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Courses & Offerings"
        description='A "course offering" links a course to a department, level and semester - this is what shows up on the timetable.'
      />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Courses</h2>
          <Button size="sm" icon={Plus} onClick={() => setCourseModal(true)}>Add course</Button>
        </div>
        {!courses ? (
          <Spinner />
        ) : courses.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses yet" description="Add a course, e.g. COM211 - Data Structures." />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{c.code}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{c.title}</td>
                    <td className="px-5 py-3 text-slate-500">{c.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Course offerings</h2>
          <Button size="sm" icon={Link2} onClick={openOfferingModal} disabled={!departments.length || !semesters.length}>
            Link course to department
          </Button>
        </div>
        {!offerings ? (
          <Spinner />
        ) : offerings.length === 0 ? (
          <EmptyState icon={Link2} title="No offerings yet" description="Link a course to a department, level and semester." />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Level</th>
                  <th className="px-5 py-3 font-medium">Semester</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offerings.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{o.course.code}</p>
                      <p className="text-xs text-slate-500">{o.course.title}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{deptName(o.department_id)}</td>
                    <td className="px-5 py-3"><Badge tone="brand">{o.level}</Badge></td>
                    <td className="px-5 py-3 text-slate-600">{semLabel(o.semester_id)}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => removeOffering(o)} className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <Modal
        open={courseModal}
        onClose={() => setCourseModal(false)}
        title="Add course"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCourseModal(false)}>Cancel</Button>
            <Button onClick={createCourse} loading={savingCourse}>Create</Button>
          </>
        }
      >
        <form onSubmit={createCourse} className="space-y-4">
          <Field label="Course code" required>
            <Input required placeholder="COM211" value={courseForm.code} onChange={(e) => setCourseForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
          </Field>
          <Field label="Course title" required>
            <Input required placeholder="Data Structures" value={courseForm.title} onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field label="Unit(s)" required>
            <Input required type="number" min={1} max={10} value={courseForm.unit} onChange={(e) => setCourseForm((f) => ({ ...f, unit: e.target.value }))} />
          </Field>
        </form>
      </Modal>

      <Modal
        open={offeringModal}
        onClose={() => setOfferingModal(false)}
        title="Link course to department / level / semester"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOfferingModal(false)}>Cancel</Button>
            <Button onClick={createOffering} loading={savingOffering}>Link course</Button>
          </>
        }
      >
        <form onSubmit={createOffering} className="space-y-4">
          <div className="flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
            <button
              type="button"
              className={`flex-1 rounded-md py-1.5 ${offeringForm.mode === "existing" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}
              onClick={() => setOfferingForm((f) => ({ ...f, mode: "existing" }))}
            >
              Existing course
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md py-1.5 ${offeringForm.mode === "new" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}
              onClick={() => setOfferingForm((f) => ({ ...f, mode: "new" }))}
            >
              New course
            </button>
          </div>

          {offeringForm.mode === "existing" ? (
            <Field label="Course" required>
              <Select
                required
                value={offeringForm.course_id}
                onChange={(e) => setOfferingForm((f) => ({ ...f, course_id: e.target.value }))}
              >
                <option value="" disabled>Select a course</option>
                {courses?.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                ))}
              </Select>
            </Field>
          ) : (
            <>
              <Field label="Course code" required>
                <Input required placeholder="STA201" value={offeringForm.course_code} onChange={(e) => setOfferingForm((f) => ({ ...f, course_code: e.target.value.toUpperCase() }))} />
              </Field>
              <Field label="Course title" required>
                <Input required placeholder="Probability I" value={offeringForm.course_title} onChange={(e) => setOfferingForm((f) => ({ ...f, course_title: e.target.value }))} />
              </Field>
              <Field label="Unit(s)">
                <Input type="number" min={1} max={10} value={offeringForm.course_unit} onChange={(e) => setOfferingForm((f) => ({ ...f, course_unit: e.target.value }))} />
              </Field>
            </>
          )}

          <Field label="Department" required>
            <Select required value={offeringForm.department_id} onChange={(e) => setOfferingForm((f) => ({ ...f, department_id: e.target.value }))}>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Level" required>
              <Select required value={offeringForm.level} onChange={(e) => setOfferingForm((f) => ({ ...f, level: e.target.value }))}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </Select>
            </Field>
            <Field label="Semester" required>
              <Select required value={offeringForm.semester_id} onChange={(e) => setOfferingForm((f) => ({ ...f, semester_id: e.target.value }))}>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                ))}
              </Select>
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
