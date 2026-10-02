import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GraduationCap, ArrowRight } from "lucide-react";
import { StudentAPI, DepartmentAPI, SemesterAPI, LEVELS, apiErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import { Field, Input, Select } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Misc";

export default function StudentRegister() {
  const navigate = useNavigate();
  const { setStudentSession } = useAuth();
  const [departments, setDepartments] = useState(null);
  const [activeSemester, setActiveSemester] = useState(null);
  const [checkedSemester, setCheckedSemester] = useState(false);
  const [form, setForm] = useState({ full_name: "", matric_no: "", department_id: "", level: "ND1" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    DepartmentAPI.list().then((d) => {
      setDepartments(d);
      setForm((f) => ({ ...f, department_id: d[0]?.id || "" }));
    });
    SemesterAPI.active().then((s) => {
      setActiveSemester(s);
      setCheckedSemester(true);
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!activeSemester) return;
    setLoading(true);
    try {
      const { access_token, student } = await StudentAPI.register({
        full_name: form.full_name,
        matric_no: form.matric_no.trim(),
        department_id: Number(form.department_id),
        level: form.level,
        semester_id: activeSemester.id,
      });
      setStudentSession(access_token, student);
      toast.success(`Welcome, ${student.full_name.split(" ")[0]}`);
      navigate("/student/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-accent-600 text-white">
            <GraduationCap className="size-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Student registration</h1>
          <p className="text-center text-sm text-slate-500">
            Register once to get your auto-allocated courses, exam seat and hall.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {!checkedSemester ? (
            <Spinner />
          ) : !activeSemester ? (
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              Registration is currently closed - there is no active semester. Please check back
              once the administrator starts the new semester.
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-800">
                Registering for <span className="font-semibold">{activeSemester.name} semester</span>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <Field label="Full name" required>
                  <Input
                    required
                    placeholder="Adeola Grace Okon"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  />
                </Field>
                <Field label="Matric number" required>
                  <Input
                    required
                    placeholder="CSD/ND/24/015"
                    value={form.matric_no}
                    onChange={(e) => setForm((f) => ({ ...f, matric_no: e.target.value }))}
                  />
                </Field>
                <Field label="Department" required>
                  <Select
                    required
                    value={form.department_id}
                    onChange={(e) => setForm((f) => ({ ...f, department_id: e.target.value }))}
                  >
                    {departments?.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Level" required>
                  <Select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </Select>
                </Field>
                <Button type="submit" variant="accent" className="w-full" icon={ArrowRight} loading={loading}>
                  Register &amp; view my courses
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link to="/student/login" className="font-medium text-accent-700 hover:underline">
            Log in
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          <Link to="/" className="font-medium text-slate-400 hover:underline">
            &larr; Back home
          </Link>
        </p>
      </div>
    </div>
  );
}
