import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "motion/react";

export function StatCard({ icon: Icon, label, value, sub, color = "blue", trend }) {
  const colors = {
    blue:   { bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10", icon: "text-blue-600 dark:text-blue-400", border: "border-blue-200/50 dark:border-blue-800/50" },
    green:  { bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10", icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200/50 dark:border-emerald-800/50" },
    orange: { bg: "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10", icon: "text-orange-600 dark:text-orange-400", border: "border-orange-200/50 dark:border-orange-800/50" },
    slate:  { bg: "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-900/10", icon: "text-slate-600 dark:text-slate-400", border: "border-slate-200/50 dark:border-slate-800/50" },
  };
  const c = colors[color] || colors.blue;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      className={`bg-white dark:bg-[#262626] rounded-xl border border-gray-200 dark:border-[#404040] ${c.border} p-6 hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        <motion.div 
          className={`p-3 rounded-lg ${c.bg}`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Icon size={20} className={c.icon} />
        </motion.div>
        {trend !== undefined && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
          >
            {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </motion.span>
        )}
      </div>
      <div className="mt-5">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-gray-900 dark:text-gray-100"
        >
          {value}
        </motion.p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{sub}</p>}
      </div>
    </motion.div>
  );
}