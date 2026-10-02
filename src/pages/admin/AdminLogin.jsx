import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { GraduationCap, KeyRound, UserPlus } from "lucide-react";
import { AdminAPI, apiErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";

export default function AdminLogin() {
  const [mode, setMode] = useState("login"); // "login" | "setup"
  const navigate = useNavigate();
  const location = useLocation();
  const { setAdminSession } = useAuth();

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [setupForm, setSetupForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const afterLogin = async (token) => {
    const me = await AdminAPI.me(token);
    setAdminSession(token, me);
    const dest = location.state?.from?.pathname || "/admin";
    navigate(dest, { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { access_token } = await AdminAPI.login(loginForm.username, loginForm.password);
      await afterLogin(access_token);
      toast.success("Welcome back");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AdminAPI.bootstrapRegister(setupForm);
      const { access_token } = await AdminAPI.login(setupForm.username, setupForm.password);
      await afterLogin(access_token);
      toast.success("Superadmin account created");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Setup failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <GraduationCap className="size-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">ExamHall Admin</h1>
          <p className="text-sm text-slate-500">Seat &amp; hall allocation system</p>
        </div>

        <div className="mb-5 flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
          <button
            className={`flex-1 rounded-md py-1.5 transition-colors ${mode === "login" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            className={`flex-1 rounded-md py-1.5 transition-colors ${mode === "setup" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}
            onClick={() => setMode("setup")}
          >
            First-time setup
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <Field label="Username" required>
              <Input
                required
                autoFocus
                value={loginForm.username}
                onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))}
              />
            </Field>
            <Field label="Password" required>
              <Input
                required
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
              />
            </Field>
            <Button type="submit" className="w-full" icon={KeyRound} loading={loading}>
              Log in
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSetup} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs text-slate-500">
              Creates the first superadmin account. This only works once - if an admin
              already exists, use "Log in" instead.
            </p>
            <Field label="Username" required>
              <Input
                required
                value={setupForm.username}
                onChange={(e) => setSetupForm((f) => ({ ...f, username: e.target.value }))}
              />
            </Field>
            <Field label="Email" required>
              <Input
                required
                type="email"
                value={setupForm.email}
                onChange={(e) => setSetupForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field label="Password" required hint="At least 6 characters">
              <Input
                required
                minLength={6}
                type="password"
                value={setupForm.password}
                onChange={(e) => setSetupForm((f) => ({ ...f, password: e.target.value }))}
              />
            </Field>
            <Button type="submit" className="w-full" icon={UserPlus} loading={loading}>
              Create superadmin
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/" className="font-medium text-brand-600 hover:underline">
            &larr; Back home
          </Link>
        </p>
      </div>
    </div>
  );
}
