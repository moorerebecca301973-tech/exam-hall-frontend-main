import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, DoorOpen, CalendarClock, CheckCircle2, XCircle, RotateCcw, Wand2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  ExamAPI,
  CourseOfferingAPI,
  DepartmentAPI,
  SemesterAPI,
  HallAPI,
  apiErrorMessage,
} from "../../lib/api";
import { PageHeader, Spinner, EmptyState } from "../../components/ui/Misc";
import { Card } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Field, Input, Select } from "../../components/ui/Input";
import Badge, { examStatusTone } from "../../components/ui/Badge";
import HallAllocationModal from "./HallAllocationModal";
import AutoAllocateModal from "./AutoAllocateModal";

export default function Exams() {
  const { adminToken } = useAuth();
  const [exams, setExams] = useState(null);
  const [offerings, setOfferings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [halls, setHalls] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState("");

  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ course_offering_id: "", exam_date: "", start_time: "", end_time: "" });
  const [saving, setSaving] = useState(false);

  const [allocatingExam, setAllocatingExam] = useState(null);
  const [autoOpen, setAutoOpen] = useState(false);

  const load = async () => {
    const [o, d, s, hallList] = await Promise.all([
      CourseOfferingAPI.list(),
      DepartmentAPI.list(),
      SemesterAPI.list(adminToken),
      HallAPI.list(),
    ]);
    setOfferings(o);
    setDepartments(d);
    setSemesters(s);
    setHalls(hallList);
    const active = s.find((sem) => sem.status === "active");
    setSemesterFilter((prev) => prev || String(active?.id || s[0]?.id || ""));
    const examList = await ExamAPI.list();
    setExams(examList);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // examId -> { course, department, level, semester_id }
  const examMeta = useMemo(() => {
    const offeringById = Object.fromEntries(offerings.map((o) => [o.id, o]));
    const deptById = Object.fromEntries(departments.map((d) => [d.id, d]));
    const map = {};
    for (const exam of exams || []) {
      const offering = offeringById[exam.course_offering_id];
      if (!offering) continue;
      map[exam.id] = {
        course: offering.course,
        department: deptById[offering.department_id] || { id: offering.department_id, code: "?", name: "?" },
        level: offering.level,
        semester_id: offering.semester_id,
      };
    }
    return map;
  }, [exams, offerings, departments]);

  const filteredExams = useMemo(() => {
    if (!exams) return [];
    const list = semesterFilter ? exams.filter((e) => String(e.semester_id) === String(semesterFilter)) : exams;
    return [...list].sort((a, b) => `${a.exam_date}${a.start_time}`.localeCompare(`${b.exam_date}${b.start_time}`));
  }, [exams, semesterFilter]);

  const offeringsWithoutExam = useMemo(() => {
    const scheduled = new Set((exams || []).map((e) => e.course_offering_id));
    return offerings.filter((o) => !scheduled.has(o.id));
  }, [offerings, exams]);

  const deptById = Object.fromEntries(departments.map((d) => [d.id, d]));

  const openCreateModal = () => {
    setForm({ course_offering_id: offeringsWithoutExam[0]?.id || "", exam_date: "", start_time: "09:00", end_time: "11:00" });
    setCreateModal(true);
  };

  const createExam = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ExamAPI.create(adminToken, {
        course_offering_id: Number(form.course_offering_id),
        exam_date: form.exam_date,
        start_time: form.start_time,
        end_time: form.end_time,
      });
      toast.success("Exam scheduled");
      setCreateModal(false);
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not schedule exam"));
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (exam, status) => {
    try {
      await ExamAPI.setStatus(adminToken, exam.id, status);
      toast.success(`Marked ${status}`);
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update status"));
    }
  };

  const siblingExamsFor = (exam) =>
    (exams || []).filter(
      (e) =>
        e.exam_date === exam.exam_date &&
        e.start_time === exam.start_time &&
        e.end_time === exam.end_time &&
        examMeta[e.id]
    );

  return (
    <div>
      <PageHeader
        title="Exam Timetable & Hall Allocation"
        description="Schedule exams, mark them completed, and allocate halls - mixing departments by matric number range."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon={Wand2}
              onClick={() => setAutoOpen(true)}
              disabled={!semesterFilter || !filteredExams.length || !halls.length}
              title={!halls.length ? "Add a hall first" : undefined}
            >
              Auto-allocate halls
            </Button>
            <Button icon={Plus} onClick={openCreateModal} disabled={!offeringsWithoutExam.length}>
              Schedule exam
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Semester:</span>
        <Select className="max-w-xs" value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
          <option value="">All semesters</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
          ))}
        </Select>
      </div>

      {!exams ? (
        <Spinner />
      ) : filteredExams.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No exams scheduled"
          description="Schedule your first exam from a course offering."
          action={<Button icon={Plus} onClick={openCreateModal} className="mt-3">Schedule exam</Button>}
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Dept / Level</th>
                <th className="px-5 py-3 font-medium">Date &amp; time</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExams.map((exam) => {
                const meta = examMeta[exam.id];
                return (
                  <tr key={exam.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{meta?.course.code}</p>
                      <p className="text-xs text-slate-500">{meta?.course.title}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {meta?.department.code} &middot; <Badge tone="brand">{meta?.level}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <p>{exam.exam_date}</p>
                      <p className="text-xs text-slate-400">{exam.start_time?.slice(0, 5)} - {exam.end_time?.slice(0, 5)}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={examStatusTone(exam.status)}>{exam.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button size="sm" variant="secondary" icon={DoorOpen} onClick={() => setAllocatingExam(exam)}>
                          Allocate hall
                        </Button>
                        {exam.status !== "completed" && (
                          <button
                            title="Mark completed"
                            onClick={() => setStatus(exam, "completed")}
                            className="rounded-md p-2 text-emerald-600 hover:bg-emerald-50"
                          >
                            <CheckCircle2 className="size-4" />
                          </button>
                        )}
                        {exam.status !== "cancelled" && (
                          <button
                            title="Cancel exam"
                            onClick={() => setStatus(exam, "cancelled")}
                            className="rounded-md p-2 text-rose-500 hover:bg-rose-50"
                          >
                            <XCircle className="size-4" />
                          </button>
                        )}
                        {exam.status !== "scheduled" && (
                          <button
                            title="Reset to scheduled"
                            onClick={() => setStatus(exam, "scheduled")}
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                          >
                            <RotateCcw className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Schedule an exam"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={createExam} loading={saving}>Schedule</Button>
          </>
        }
      >
        <form onSubmit={createExam} className="space-y-4">
          <Field label="Course offering" required hint="Only offerings without an exam yet are listed">
            <Select required value={form.course_offering_id} onChange={(e) => setForm((f) => ({ ...f, course_offering_id: e.target.value }))}>
              {offeringsWithoutExam.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.course.code} - {o.course.title} ({deptById[o.department_id]?.code}, {o.level})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Exam date" required>
            <Input required type="date" value={form.exam_date} onChange={(e) => setForm((f) => ({ ...f, exam_date: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start time" required>
              <Input required type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
            </Field>
            <Field label="End time" required>
              <Input required type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
            </Field>
          </div>
        </form>
      </Modal>

      <AutoAllocateModal
        open={autoOpen}
        onClose={() => setAutoOpen(false)}
        adminToken={adminToken}
        semesterId={semesterFilter ? Number(semesterFilter) : undefined}
        scopeLabel="every scheduled exam in the selected semester"
        halls={halls}
        onDone={load}
      />

      {allocatingExam && (
        <HallAllocationModal
          open={!!allocatingExam}
          onClose={() => setAllocatingExam(null)}
          exam={allocatingExam}
          siblingExams={siblingExamsFor(allocatingExam)}
          examMeta={examMeta}
          halls={halls}
          adminToken={adminToken}
          onChanged={load}
        />
      )}
    </div>
  );
}
