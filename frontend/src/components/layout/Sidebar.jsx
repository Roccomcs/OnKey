import { Building2, Users, FileText, Bell, LayoutDashboard, Sun, Moon, LogOut, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

const NAV = [
  { id: "dashboard",     label: "Dashboard",   icon: LayoutDashboard },
  { id: "properties",    label: "Propiedades", icon: Building2 },
  { id: "contacts",      label: "Contactos",   icon: Users },
  { id: "leases",        label: "Contratos",   icon: FileText },
  { id: "notifications", label: "Alertas",     icon: Bell },
];

export function Sidebar({ active, setActive, alertCount, dark, toggleDark, user, tenant, onLogout, subscription }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSelectPlanes = () => {
    setActive("planes");
    setUserMenuOpen(false);
  };
  
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-60 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen sticky top-0"
    >

      {/* Logo */}
      <motion.div 
        className="px-5 py-6 border-b border-gray-200 dark:border-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            <Building2 size={18} className="text-white" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {tenant?.nombre === 'Default Tenant' ? 'OnKey' : (tenant?.nombre || 'OnKey')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gestión inmobiliaria</p>
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon size={18} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"} />
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
        className="px-3 py-4 space-y-2 border-t border-gray-200 dark:border-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* User Menu */}
        <div className="relative">
          <motion.button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-medium truncate">{user?.email?.split('@')[0] || 'Usuario'}</p>
            </div>
            <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </motion.button>
          
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-50"
            >
              <button
                onClick={handleSelectPlanes}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings size={16} />
                Planes & Suscripción
              </button>
              <button
                onClick={() => {
                  toggleDark();
                  setUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
                {dark ? 'Tema claro' : 'Tema oscuro'}
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-200 dark:border-gray-700"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </motion.div>
          )}
        </div>

        {/* Theme & Logout Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDark}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
            title={dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </motion.div>
    </motion.aside>
  );
}