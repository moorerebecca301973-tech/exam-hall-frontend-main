import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Wand2, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";
import { HallAllocationAPI, apiErrorMessage } from "../../lib/api";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

/**
 * Automatic hall allocation. The server picks halls, matric ranges and seat
 * numbers; the admin only chooses the scope (a whole semester, or specific
 * exams) and a couple of options. "Preview" runs a dry run that saves nothing.
 *
 * Pass either `semesterId` or `examIds` (or both).
 */
export default function AutoAllocateModal({
  open,
  onClose,
  adminToken,
  title = "Auto-allocate halls",
  scopeLabel,
  semesterId,
  examIds,
  halls,
  onDone,
}) {
  const [allowMixing, setAllowMixing] = useState(true);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [selectedHalls, setSelectedHalls] = useState([]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(null); // "preview" | "run" | null

  useEffect(() => {
    if (!open) return;
    setAllowMixing(true);
    setReplaceExisting(true);
    setSelectedHalls(halls.map((h) => h.id));
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleHall = (id) =>
    setSelectedHalls((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const run = async (dryRun) => {
    if (!selectedHalls.length) {
      toast.error("Select at least one hall");
      return;
    }
    setBusy(dryRun ? "preview" : "run");
    try {
      const data = await HallAllocationAPI.autoAllocate(adminToken, {
        semester_id: semesterId || null,
        exam_ids: examIds?.length ? examIds : null,
        hall_ids: selectedHalls.length === halls.length ? null : selectedHalls,
        allow_mixing: allowMixing,
        replace_existing: replaceExisting,
        dry_run: dryRun,
      });
      setResult(data);
      if (!dryRun) {
        const seated = data.exams.reduce((n, e) => n + e.seated, 0);
        if (data.warnings.length) {
          toast.error(`Allocated ${seated} student(s), with warnings - see below`, { duration: 6000 });
        } else {
          toast.success(`Halls allocated - ${seated} student(s) seated`);
        }
        onDone?.();
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not allocate halls"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="secondary" icon={Eye} loading={busy === "preview"} disabled={!!busy} onClick={() => run(true)}>
            Preview
          </Button>
          <Button icon={Wand2} loading={busy === "run"} disabled={!!busy} onClick={() => run(false)}>
            Allocate now
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-slate-600">
        Halls, matric ranges and seat numbers are chosen for you{scopeLabel ? ` for ${scopeLabel}` : ""}. Exams sitting
        at the same time are packed into the selected halls, biggest first, using only students who have registered.
      </p>

      <div className="space-y-3 rounded-lg border border-slate-200 p-3 text-sm">
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-0.5" checked={allowMixing} onChange={(e) => setAllowMixing(e.target.checked)} />
          <span>
            <span className="font-medium text-slate-800">Mix departments in a hall</span>
            <span className="block text-xs text-slate-500">
              Leftover seats go to other departments sitting at the same time. Off = one exam per hall.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-0.5" checked={replaceExisting} onChange={(e) => setReplaceExisting(e.target.checked)} />
          <span>
            <span className="font-medium text-slate-800">Redo exams that already have a hall</span>
            <span className="block text-xs text-slate-500">
              Replaces their current blocks (students' seats may change). Off = leave them as they are.
            </span>
          </span>
        </label>
        <div>
          <p className="mb-1.5 font-medium text-slate-800">Halls to use</p>
          <div className="flex flex-wrap gap-2">
            {halls.map((h) => (
              <label
                key={h.id}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs ${
                  selectedHalls.includes(h.id) ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500"
                }`}
              >
                <input type="checkbox" checked={selectedHalls.includes(h.id)} onChange={() => toggleHall(h.id)} />
                {h.name} ({h.total_seats})
              </label>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-700">{result.dry_run ? "Preview (nothing saved yet)" : "Result"}</h4>
            {result.dry_run && <Badge tone="amber">dry run</Badge>}
            {!result.dry_run && <CheckCircle2 className="size-4 text-emerald-600" />}
          </div>

          {result.warnings.length > 0 && (
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              {result.warnings.map((w, i) => (
                <p key={i} className="flex items-start gap-1.5">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  {w}
                </p>
              ))}
            </div>
          )}

          {result.skipped.length > 0 && (
            <p className="text-xs text-slate-500">Skipped: {result.skipped.join("; ")}</p>
          )}

          {result.exams.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing to allocate.</p>
          ) : (
            <ul className="space-y-2">
              {result.exams.map((e) => (
                <li key={e.exam_schedule_id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800">
                      {e.course_code}{" "}
                      <span className="font-normal text-slate-500">
                        {e.department_code} &middot; {e.level} &middot; {e.exam_date} {e.start_time}-{e.end_time}
                      </span>
                    </p>
                    <Badge tone={e.seated === e.total_students && e.total_students > 0 ? "green" : "amber"}>
                      {e.seated}/{e.total_students} seated
                    </Badge>
                  </div>
                  {e.blocks.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-xs text-slate-600">
                      {e.blocks.map((b, i) => (
                        <li key={i}>
                          <span className="font-medium">{b.hall_name}</span> &middot; seats {b.seat_start_no}-{b.seat_end_no}{" "}
                          &middot; {b.matric_start} &rarr; {b.matric_end}
                        </li>
                      ))}
                    </ul>
                  )}
                  {e.unseated.length > 0 && (
                    <p className="mt-1.5 text-xs text-rose-600">
                      Unseated: {e.unseated.slice(0, 5).join(", ")}
                      {e.unseated.length > 5 ? ` +${e.unseated.length - 5} more` : ""}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
