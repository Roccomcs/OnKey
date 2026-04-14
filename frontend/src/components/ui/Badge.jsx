export function Badge({ status }) {
  const map = {
    ocupado:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    vacante:    "bg-gray-100 text-gray-600 dark:bg-[#2d2d2d] dark:text-gray-300",
    activo:     "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    vencido:    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    rescindido: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    renovado:   "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    pendiente:  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || "bg-gray-100 text-gray-600 dark:bg-[#2d2d2d] dark:text-gray-300"}`}>
      {status}
    </span>
  );
}