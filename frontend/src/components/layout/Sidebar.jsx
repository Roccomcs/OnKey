import { Building2, Users, FileText, Bell, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

const NAV = [
  { id: "dashboard",     label: "Dashboard",   icon: LayoutDashboard },
  { id: "properties",    label: "Propiedades", icon: Building2 },
  { id: "contacts",      label: "Contactos",   icon: Users },
  { id: "leases",        label: "Contratos",   icon: FileText },
  { id: "notifications", label: "Alertas",     icon: Bell },
];

export function Sidebar({ active, setActive, alertCount, dark, toggleDark, user, tenant, onLogout, subscription, sidebarOpen, setSidebarOpen }) {
  
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      layout
      className={`flex-shrink-0 bg-white dark:bg-[#0f0f0f] border-r border-gray-200 dark:border-[#333333] flex flex-col h-screen sticky top-0 overflow-hidden transition-all duration-300 ${
        sidebarOpen ? "w-60" : "w-20"
      }`}
    >

      {/* Logo */}
      <motion.div 
        className={`px-3 py-5 border-b border-gray-200 dark:border-[#333333] flex gap-1 transition-all duration-300 ${
          sidebarOpen 
            ? "items-center justify-between" 
            : "flex-col items-center justify-center"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Logo Image - Solo cuando está abierto */}
        {sidebarOpen && (
          <motion.img 
            src="/Gemini_Generated_Image_5pu4335pu4335pu4-removebg-preview.png"
            alt="OnKey"
            className="h-16 w-auto flex-shrink-0 transition-all duration-300 order-1"
            whileHover={{ scale: 1.05 }}
          />
        )}

        {/* OnKey Text - Cuando está abierto o cerrado */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 ${sidebarOpen ? "flex-1 min-w-0 order-2" : "order-2"}`}
        >
          <p className={`font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400 ${
            sidebarOpen ? "text-xl truncate" : "text-sm"
          }`}>
            onKey
          </p>
        </motion.div>

        {/* Toggle Button */}
        <motion.button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-1 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors flex-shrink-0 ${
            sidebarOpen ? "order-3" : "order-1"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title={sidebarOpen ? "Cerrar sidebar" : "Abrir sidebar"}
        >
          {sidebarOpen ? (
            <ChevronLeft size={16} className="text-gray-500 dark:text-gray-500" />
          ) : (
            <ChevronRight size={16} className="text-gray-500 dark:text-gray-500" />
          )}
        </motion.button>
      </motion.div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV.map(({ id, label, icon: Icon }, idx) => {
          const isActive = active === id;
          const badge    = id === "notifications" && alertCount > 0;
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              whileHover={{ x: sidebarOpen ? 4 : 0 }}
              onClick={() => setActive(id)}
              title={!sidebarOpen ? label : ""}
              className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
              } ${!sidebarOpen ? "justify-center" : ""}`}
            >
              <Icon size={20} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"} />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{label}</span>
                  {badge && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0"
                    >
                      {alertCount}
                    </motion.span>
                  )}
                </>
              )}
              {!sidebarOpen && badge && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 flex-shrink-0"
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