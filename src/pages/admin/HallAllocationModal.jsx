import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, RefreshCw, AlertTriangle, Wand2 } from "lucide-react";
import { HallAllocationAPI, apiErrorMessage } from "../../lib/api";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { Field, Input, Select } from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Misc";
import AutoAllocateModal from "./AutoAllocateModal";

/**
 * Manages hall allocation for one exam "sitting": books a hall and adds
 * department/course blocks to it. `siblingExams` are every exam that
 * shares the exact same exam_date/start_time/end_time as `exam` (including
 * itself) - these are the only valid choices for each row, since they
 * physically share the room at once. `examMeta` maps exam id -> {course,
 * department, level} for display + for deriving department_id/level when
 * building the request payload.
 */
export default function HallAllocationModal({
  open,
  onClose,
  exam,
  siblingExams,
  examMeta,
  halls,
  adminToken,
  onChanged,
}) {
  const [existing, setExisting] = useState(null);
  const [hallId, setHallId] = useState("");
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [busyRangeId, setBusyRangeId] = useState(null);
  const [autoOpen, setAutoOpen] = useState(false);

  const loadExisting = async () => {
    const data = await HallAllocationAPI.listForExam(adminToken, exam.id);
    setExisting(data);
  };

  useEffect(() => {
    if (!open) return;
    setHallId(halls[0]?.id || "");
    setRows([{ exam_schedule_id: exam.id, matric_start: "", matric_end: "", seat_start_no: "", seat_end_no: "" }]);
    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, exam.id]);

  const addRow = () =>
    setRows((r) => [
      ...r,
      { exam_schedule_id: exam.id, matric_start: "", matric_end: "", seat_start_no: "", seat_end_no: "" },
    ]);

  const updateRow = (idx, field, value) =>
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));

  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    if (!hallId) {
      toast.error("Select a hall");
      return;
    }
    setSaving(true);
    try {
      const department_ranges = rows.map((row) => {
        const meta = examMeta[row.exam_schedule_id];
        return {
          exam_schedule_id: Number(row.exam_schedule_id),
          department_id: meta.department.id,
          level: meta.level,
          matric_start: row.matric_start,
          matric_end: row.matric_end,
          seat_start_no: Number(row.seat_start_no),
          seat_end_no: Number(row.seat_end_no),
        };
      });
      await HallAllocationAPI.allocate(adminToken, { hall_id: Number(hallId), department_ranges });

      // Surface any overflow (more students than seats) per affected exam.
      const affectedExamIds = [...new Set(department_ranges.map((r) => r.exam_schedule_id))];
      const overflowMsgs = [];
      for (const id of affectedExamIds) {
        const result = await HallAllocationAPI.recompute(adminToken, id);
        if (result.overflow_students?.length) {
          overflowMsgs.push(`${examMeta[id].course.code}: ${result.overflow_students.length} student(s) unseated`);
        }
      }
      if (overflowMsgs.length) {
        toast.error(`Allocated, but some ranges are full - ${overflowMsgs.join("; ")}`, { duration: 7000 });
      } else {
        toast.success("Hall allocated and seats computed");
      }
      await loadExisting();
      onChanged?.();
      setRows([{ exam_schedule_id: exam.id, matric_start: "", matric_end: "", seat_start_no: "", seat_end_no: "" }]);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not allocate hall"));
    } finally {
      setSaving(false);
    }
  };

  const removeRange = async (rangeId) => {
    if (!confirm("Remove this department block? Affected students will lose their seat for that exam until reallocated.")) return;
    setBusyRangeId(rangeId);
    try {
      await HallAllocationAPI.removeRange(adminToken, rangeId);
      toast.success("Block removed");
      await loadExisting();
      onChanged?.();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not remove block"));
    } finally {
      setBusyRangeId(null);
    }
  };

  const recomputeExam = async () => {
    try {
      const result = await HallAllocationAPI.recompute(adminToken, exam.id);
      if (result.overflow_students?.length) {
        toast.error(`${result.overflow_students.length} student(s) unseated - widen a range or add another block`);
      } else {
        toast.success(`${result.allocated} student(s) seated`);
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not recompute seats"));
    }
  };

  if (!open) return null;
  const meta = examMeta[exam.id];

  return (
    <Modal open={open} onClose={onClose} title={`Allocate hall - ${meta?.course.code}`} wide>
      <div className="mb-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-800">{exam.exam_date}</span>{" "}
          {exam.start_time?.slice(0, 5)} - {exam.end_time?.slice(0, 5)}
        </p>
        <p className="mt-0.5">
          Other courses sitting at the exact same time can share a hall with this one -
          they'll appear in the "Course / department" dropdown below.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-200 bg-brand-50 p-3">
        <p className="text-sm text-brand-800">
          Skip the manual ranges - let the system pick halls and seats for this sitting.
        </p>
        <Button size="sm" icon={Wand2} onClick={() => setAutoOpen(true)}>
          Auto-allocate this sitting
        </Button>
      </div>

      {/* Existing allocations for this exam */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-700">Current allocation</h4>
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={recomputeExam}>
            Recompute seats
          </Button>
        </div>
        {!existing ? (
          <Spinner />
        ) : existing.length === 0 ? (
          <p className="text-sm text-slate-500">No hall allocated yet for this exam.</p>
        ) : (
          <div className="space-y-3">
            {existing.map((alloc) => {
              const hall = halls.find((h) => h.id === alloc.hall_id);
              const rangesForThisExam = alloc.department_ranges.filter((r) => r.exam_schedule_id === exam.id);
              const otherRanges = alloc.department_ranges.filter((r) => r.exam_schedule_id !== exam.id);
              return (
                <div key={alloc.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="mb-2 text-sm font-semibold text-slate-800">{hall?.name || `Hall #${alloc.hall_id}`}</p>
                  <ul className="space-y-1.5">
                    {rangesForThisExam.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-600">
                          <Badge tone="brand">{examMeta[r.exam_schedule_id]?.department.code}</Badge>{" "}
                          {r.matric_start} - {r.matric_end} &rarr; seats {r.seat_start_no}-{r.seat_end_no}
                        </span>
                        <button
                          disabled={busyRangeId === r.id}
                          onClick={() => removeRange(r.id)}
                          className="rounded p-1 text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                    {otherRanges.length > 0 && (
                      <li className="pt-1 text-xs text-slate-400">
                        + shares this hall with: {otherRanges.map((r) => examMeta[r.exam_schedule_id]?.course.code).join(", ")}
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add new blocks */}
      <form onSubmit={submit} className="space-y-4 border-t border-slate-100 pt-5">
        <h4 className="text-sm font-semibold text-slate-700">Add department block(s)</h4>

        <Field label="Hall" required>
          <Select required value={hallId} onChange={(e) => setHallId(e.target.value)}>
            <option value="" disabled>Select a hall</option>
            {halls.map((h) => (
              <option key={h.id} value={h.id}>{h.name} ({h.total_seats} seats)</option>
            ))}
          </Select>
        </Field>

        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <Field label="Course / department">
                  <Select value={row.exam_schedule_id} onChange={(e) => updateRow(idx, "exam_schedule_id", e.target.value)}>
                    {siblingExams.map((se) => (
                      <option key={se.id} value={se.id}>
                        {examMeta[se.id]?.course.code} - {examMeta[se.id]?.department.code} ({examMeta[se.id]?.level})
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Matric start" className="sm:col-span-1">
                <Input required placeholder="CSD/ND/24/001" value={row.matric_start} onChange={(e) => updateRow(idx, "matric_start", e.target.value)} />
              </Field>
              <Field label="Matric end" className="sm:col-span-1">
                <Input required placeholder="CSD/ND/24/060" value={row.matric_end} onChange={(e) => updateRow(idx, "matric_end", e.target.value)} />
              </Field>
              <Field label="Seat from" className="sm:col-span-1">
                <Input required type="number" min={1} value={row.seat_start_no} onChange={(e) => updateRow(idx, "seat_start_no", e.target.value)} />
              </Field>
              <div className="flex items-end gap-1 sm:col-span-1">
                <Field label="Seat to" className="flex-1">
                  <Input required type="number" min={1} value={row.seat_end_no} onChange={(e) => updateRow(idx, "seat_end_no", e.target.value)} />
                </Field>
                {rows.length > 1 && (
                  <button type="button" onClick={() => removeRow(idx)} className="mb-0.5 rounded-md p-2 text-rose-500 hover:bg-rose-50">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addRow}>
          Add another department block
        </Button>

        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          Seats are assigned by rank among students who registered and fall inside the matric
          range - if a range has more students than seats, the extras are reported after you submit.
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
          <Button type="submit" loading={saving}>Save allocation</Button>
        </div>
      </form>
      <AutoAllocateModal
        open={autoOpen}
        onClose={() => setAutoOpen(false)}
        adminToken={adminToken}
        title={`Auto-allocate - ${meta?.course.code} sitting`}
        scopeLabel="every exam sitting at this date and time"
        examIds={siblingExams.map((e) => e.id)}
        halls={halls}
        onDone={() => {
          loadExisting();
          onChanged?.();
        }}
      />
    </Modal>
  );
}
