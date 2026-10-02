import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DepartmentAPI, apiErrorMessage } from "../../lib/api";
import { PageHeader, Spinner, EmptyState } from "../../components/ui/Misc";
import { Card } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Field, Input } from "../../components/ui/Input";

export default function Departments() {
  const { adminToken } = useAuth();
  const [items, setItems] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", code: "" });
  const [saving, setSaving] = useState(false);

  const load = () => DepartmentAPI.list().then(setItems);

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", code: "" });
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setForm({ name: dept.name, code: dept.code });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await DepartmentAPI.update(adminToken, editing.id, form);
        toast.success("Department updated");
      } else {
        await DepartmentAPI.create(adminToken, form);
        toast.success("Department created");
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not save department"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (dept) => {
    if (!confirm(`Delete "${dept.name}"? This cannot be undone.`)) return;
    try {
      await DepartmentAPI.remove(adminToken, dept.id);
      toast.success("Department deleted");
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not delete department"));
    }
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Departments are linked to courses, students and hall seat blocks."
        action={<Button icon={Plus} onClick={openCreate}>Add department</Button>}
      />

      {!items ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments yet"
          description="Add your first department, e.g. Computer Science (CSD)."
          action={<Button icon={Plus} onClick={openCreate} className="mt-3">Add department</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{dept.name}</td>
                  <td className="px-5 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                      {dept.code}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(dept)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => remove(dept)} className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit department" : "Add department"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={saving}>{editing ? "Save changes" : "Create"}</Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Department name" required>
            <Input
              required
              placeholder="Computer Science"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="Code" required hint="Short code used in matric numbers, e.g. CSD">
            <Input
              required
              placeholder="CSD"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
