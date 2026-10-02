import clsx from "clsx";

export function Field({ label, hint, error, required, children, className }) {
  return (
    <label className={clsx("block", className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

const baseInputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-400 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-100 " +
  "disabled:bg-slate-50 disabled:text-slate-400";

export function Input({ className, ...props }) {
  return <input className={clsx(baseInputClass, className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={clsx(baseInputClass, "cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }) {
  return <textarea className={clsx(baseInputClass, className)} {...props} />;
}
