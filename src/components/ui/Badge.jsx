import clsx from "clsx";

const TONES = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  cyan: "bg-accent-50 text-accent-700 ring-accent-200",
};

export default function Badge({ tone = "slate", children, className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function semesterStatusTone(status) {
  return { draft: "slate", active: "green", submitted: "rose" }[status] || "slate";
}

export function examStatusTone(status) {
  return { scheduled: "brand", completed: "green", cancelled: "rose" }[status] || "slate";
}
