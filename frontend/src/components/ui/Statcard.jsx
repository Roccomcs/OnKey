import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatCard({ icon: Icon, label, value, sub, color = "blue", trend }) {
  const colors = {
    blue:   { bg: "bg-blue-50 dark:bg-blue-900/30",       icon: "text-blue-600 dark:text-blue-400" },
    green:  { bg: "bg-emerald-50 dark:bg-emerald-900/30", icon: "text-emerald-600 dark:text-emerald-400" },
    orange: { bg: "bg-orange-50 dark:bg-orange-900/30",   icon: "text-orange-600 dark:text-orange-400" },
    slate:  { bg: "bg-slate-50 dark:bg-slate-700",        icon: "text-slate-600 dark:text-slate-300" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${c.bg}`}>
          <Icon size={18} className={c.icon} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}