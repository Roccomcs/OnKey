export function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}

export function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-[#404040] rounded-xl bg-gray-50 dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#2d2d2d] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-[#404040] rounded-xl bg-gray-50 dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#2d2d2d] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
    >
      {children}
    </select>
  );
}