import { Building2, Users, FileText, Bell, LayoutDashboard } from "lucide-react";
import { motion } from "motion/react";

const NAV = [
  { id: "dashboard",     label: "Dashboard",   icon: LayoutDashboard },
  { id: "properties",    label: "Propiedades", icon: Building2 },
  { id: "contacts",      label: "Contactos",   icon: Users },
  { id: "leases",        label: "Contratos",   icon: FileText },
  { id: "notifications", label: "Alertas",     icon: Bell },
];

export function Sidebar({ active, setActive, alertCount, dark, toggleDark, user, tenant, onLogout, subscription }) {
  
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-60 flex-shrink-0 bg-white dark:bg-[#0f0f0f] border-r border-gray-200 dark:border-[#333333] flex flex-col h-screen sticky top-0"
    >

      {/* Logo */}
      <motion.div 
        className="px-5 py-8 border-b border-gray-200 dark:border-[#333333]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            <Building2 size={20} className="text-white" />
          </motion.div>
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">
              {tenant?.nombre === 'Default Tenant' ? 'OnKey' : (tenant?.nombre || 'OnKey')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gestión inmobiliaria</p>
          </div>
        </div>
      </motion.div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ id, label, icon: Icon }, idx) => {
          const isActive = active === id;
          const badge    = id === "notifications" && alertCount > 0;
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              whileHover={{ x: 4 }}
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
              }`}
            >
              <Icon size={20} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"} />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {alertCount}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <motion.div 
        className="px-3 py-4 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Placeholder para mantener estructura */}
      </motion.div>
    </motion.aside>
  );
}