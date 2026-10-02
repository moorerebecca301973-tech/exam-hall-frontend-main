import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, DoorOpen, Armchair } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { HallAPI, apiErrorMessage } from "../../lib/api";
import { PageHeader, Spinner, EmptyState } from "../../components/ui/Misc";
import { Card } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Field, Input } from "../../components/ui/Input";

const emptyForm = { name: "", code: "", total_seats: "", rows: "", columns: "" };

export default function Halls() {
  const { adminToken } = useAuth();
  const [items, setItems] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => HallAPI.list().then(setItems);

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (hall) => {
    setEditing(hall);
    setForm({
      name: hall.name,
      code: hall.code,
      total_seats: hall.total_seats,
      rows: hall.rows ?? "",
      columns: hall.columns ?? "",
    });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        code: form.code,
        total_seats: Number(form.total_seats),
        rows: form.rows === "" ? null : Number(form.rows),
        columns: form.columns === "" ? null : Number(form.columns),
      };
      if (editing) {
        await HallAPI.update(adminToken, editing.id, payload);
        toast.success("Hall updated");
      } else {
        await HallAPI.create(adminToken, payload);
        toast.success("Hall created");
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not save hall"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (hall) => {
    if (!confirm(`Delete hall "${hall.name}"?`)) return;
    try {
      await HallAPI.remove(adminToken, hall.id);
      toast.success("Hall deleted");
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not delete hall"));
    }
  };

  return (
    <div>
      <PageHeader
        title="Halls"
        description="Physical exam halls and their total seat capacity."
        action={<Button icon={Plus} onClick={openCreate}>Add hall</Button>}
      />

      {!items ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState icon={DoorOpen} title="No halls yet" description='Add a hall, e.g. "Hall A" with 200 seats.' action={<Button icon={Plus} onClick={openCreate} className="mt-3">Add hall</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((hall) => (
            <Card key={hall.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{hall.name}</p>
                  <p className="font-mono text-xs text-slate-400">{hall.code}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(hall)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
                    <Pencil className="size-4" />
                  </button>
                  <button onClick={() => remove(hall)} className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <Armchair className="size-4 text-brand-500" />
                {hall.total_seats} seats
                {hall.rows && hall.columns && (
                  <span className="text-slate-400"> &middot; {hall.rows}&times;{hall.columns} layout</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit hall" : "Add hall"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={saving}>{editing ? "Save changes" : "Create"}</Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Hall name" required>
            <Input required placeholder="Hall A" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Code" required>
            <Input required placeholder="HA" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
          </Field>
          <Field label="Total seats" required>
            <Input required type="number" min={1} value={form.total_seats} onChange={(e) => setForm((f) => ({ ...f, total_seats: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rows" hint="Optional">
              <Input type="number" min={1} value={form.rows} onChange={(e) => setForm((f) => ({ ...f, rows: e.target.value }))} />
            </Field>
            <Field label="Columns" hint="Optional">
              <Input type="number" min={1} value={form.columns} onChange={(e) => setForm((f) => ({ ...f, columns: e.target.value }))} />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
