import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, PlayCircle, Lock, CalendarRange } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { SessionAPI, SemesterAPI, SEMESTER_NAMES, apiErrorMessage } from "../../lib/api";
import { PageHeader, Spinner, EmptyState } from "../../components/ui/Misc";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Field, Input, Select } from "../../components/ui/Input";
import Badge, { semesterStatusTone } from "../../components/ui/Badge";

export default function Sessions() {
  const { adminToken } = useAuth();
  const [sessions, setSessions] = useState(null);
  const [semesters, setSemesters] = useState(null);

  const [sessionModal, setSessionModal] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [savingSession, setSavingSession] = useState(false);

  const [semesterModal, setSemesterModal] = useState(false);
  const [semesterForm, setSemesterForm] = useState({ session_id: "", name: "First" });
  const [savingSemester, setSavingSemester] = useState(false);

  const [busyId, setBusyId] = useState(null);

  const load = () =>
    Promise.all([SessionAPI.list(adminToken), SemesterAPI.list(adminToken)]).then(
      ([s, sem]) => {
        setSessions(s);
        setSemesters(sem);
      }
    );

  useEffect(() => {
    load();
  }, []);

  const createSession = async (e) => {
    e.preventDefault();
    setSavingSession(true);
    try {
      await SessionAPI.create(adminToken, { name: sessionName });
      toast.success("Session created");
      setSessionModal(false);
      setSessionName("");
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create session"));
    } finally {
      setSavingSession(false);
    }
  };

  const openSemesterModal = () => {
    setSemesterForm({ session_id: sessions?.[0]?.id || "", name: "First" });
    setSemesterModal(true);
  };

  const createSemester = async (e) => {
    e.preventDefault();
    setSavingSemester(true);
    try {
      await SemesterAPI.create(adminToken, {
        session_id: Number(semesterForm.session_id),
        name: semesterForm.name,
      });
      toast.success("Semester created (draft)");
      setSemesterModal(false);
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create semester"));
    } finally {
      setSavingSemester(false);
    }
  };

  const startSemester = async (id) => {
    setBusyId(id);
    try {
      await SemesterAPI.start(adminToken, id);
      toast.success("Semester started - now active");
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not start semester"));
    } finally {
      setBusyId(null);
    }
  };

  const submitSemester = async (id) => {
    if (
      !confirm(
        "Submit (close) this semester? Students will no longer be able to register or view seat allocations for it."
      )
    )
      return;
    setBusyId(id);
    try {
      await SemesterAPI.submit(adminToken, id);
      toast.success("Semester submitted and locked");
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not submit semester"));
    } finally {
      setBusyId(null);
    }
  };

  const sessionName_ = (id) => sessions?.find((s) => s.id === id)?.name || `#${id}`;

  return (
    <div>
      <PageHeader
        title="Sessions & Semesters"
        description="Start a semester so students can register; submit it once exams are over to lock it."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Plus} onClick={() => setSessionModal(true)}>
              New session
            </Button>
            <Button icon={Plus} onClick={openSemesterModal} disabled={!sessions?.length}>
              New semester
            </Button>
          </div>
        }
      />

      {!semesters ? (
        <Spinner />
      ) : semesters.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No semesters yet"
          description='Create an academic session (e.g. "2025/2026") first, then add a semester.'
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Session</th>
                <th className="px-5 py-3 font-medium">Semester</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {semesters.map((sem) => (
                <tr key={sem.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-600">{sessionName_(sem.session_id)}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{sem.name}</td>
                  <td className="px-5 py-3">
                    <Badge tone={semesterStatusTone(sem.status)}>{sem.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {sem.status === "draft" && (
                      <Button size="sm" variant="secondary" icon={PlayCircle} loading={busyId === sem.id} onClick={() => startSemester(sem.id)}>
                        Start
                      </Button>
                    )}
                    {sem.status === "active" && (
                      <Button size="sm" variant="danger" icon={Lock} loading={busyId === sem.id} onClick={() => submitSemester(sem.id)}>
                        Submit & lock
                      </Button>
                    )}
                    {sem.status === "submitted" && <span className="text-xs text-slate-400">Closed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={sessionModal}
        onClose={() => setSessionModal(false)}
        title="New academic session"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSessionModal(false)}>Cancel</Button>
            <Button onClick={createSession} loading={savingSession}>Create</Button>
          </>
        }
      >
        <form onSubmit={createSession}>
          <Field label="Session name" required hint='e.g. "2025/2026"'>
            <Input required placeholder="2025/2026" value={sessionName} onChange={(e) => setSessionName(e.target.value)} />
          </Field>
        </form>
      </Modal>

      <Modal
        open={semesterModal}
        onClose={() => setSemesterModal(false)}
        title="New semester"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSemesterModal(false)}>Cancel</Button>
            <Button onClick={createSemester} loading={savingSemester}>Create</Button>
          </>
        }
      >
        <form onSubmit={createSemester} className="space-y-4">
          <Field label="Academic session" required>
            <Select
              required
              value={semesterForm.session_id}
              onChange={(e) => setSemesterForm((f) => ({ ...f, session_id: e.target.value }))}
            >
              {sessions?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Semester" required>
            <Select
              value={semesterForm.name}
              onChange={(e) => setSemesterForm((f) => ({ ...f, name: e.target.value }))}
            >
              {SEMESTER_NAMES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Select>
          </Field>
          <p className="text-xs text-slate-500">
            New semesters start as "draft". Use "Start" on the list to make one active.
          </p>
        </form>
      </Modal>
    </div>
  );
}
