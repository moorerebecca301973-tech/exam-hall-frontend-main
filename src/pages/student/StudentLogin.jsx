import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GraduationCap, LogIn } from "lucide-react";
import { StudentAPI, apiErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";

export default function StudentLogin() {
  const navigate = useNavigate();
  const { setStudentSession } = useAuth();
  const [form, setForm] = useState({ matric_no: "", full_name: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { access_token, student } = await StudentAPI.login({
        matric_no: form.matric_no.trim(),
        full_name: form.full_name.trim(),
      });
      setStudentSession(access_token, student);
      toast.success(`Welcome back, ${student.full_name.split(" ")[0]}`);
      navigate("/student/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err, "No matching registration found"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-accent-600 text-white">
            <GraduationCap className="size-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Student log in</h1>
          <p className="text-sm text-slate-500">Enter the details you registered with</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Field label="Matric number" required>
            <Input
              required
              autoFocus
              placeholder="CSD/ND/24/015"
              value={form.matric_no}
              onChange={(e) => setForm((f) => ({ ...f, matric_no: e.target.value }))}
            />
          </Field>
          <Field label="Full name" required hint="Exactly as you registered it">
            <Input
              required
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            />
          </Field>
          <Button type="submit" variant="accent" className="w-full" icon={LogIn} loading={loading}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Not registered yet?{" "}
          <Link to="/student/register" className="font-medium text-accent-700 hover:underline">
            Register
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
