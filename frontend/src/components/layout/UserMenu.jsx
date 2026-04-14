import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Settings, CreditCard, LogOut, Sun, Moon, HelpCircle,
  ChevronRight, Bell
} from "lucide-react";

export function UserMenu({ user, dark, toggleDark, onLogout, onSelectPlanes }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú cuando se clickea afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const username = user?.email?.split('@')[0] || 'Usuario';
  const userInitial = user?.email?.[0].toUpperCase() || 'U';

  const menuItems = [
    {
      icon: User,
      label: "Perfil",
      onClick: () => { setOpen(false); },
    },
    {
      icon: CreditCard,
      label: "Planes & Suscripción",
      onClick: () => { onSelectPlanes(); setOpen(false); },
    },
    {
      icon: Settings,
      label: "Configuración",
      onClick: () => { setOpen(false); },
    },
  ];

  const themeItems = [
    {
      icon: dark ? Sun : Moon,
      label: dark ? "Tema claro" : "Tema oscuro",
      onClick: () => { toggleDark(); setOpen(false); },
    },
  ];

  const supportItems = [
    {
      icon: HelpCircle,
      label: "Soporte",
      onClick: () => { setOpen(false); },
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
          {userInitial}
        </div>
        <span className="hidden sm:inline text-base font-medium text-gray-700 dark:text-gray-300">
          {username}
        </span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#262626] rounded-xl border border-gray-100 dark:border-[#404040] shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-base">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold truncate">{username}</p>
                  <p className="text-sm text-white/70 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items - Section 1: Account */}
            <div className="py-1">
              {menuItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={idx}
                    onClick={item.onClick}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex items-center justify-between px-4 py-3 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-[#404040] to-transparent" />

            {/* Menu Items - Section 2: Preferences */}
            <div className="py-1">
              {themeItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={idx}
                    onClick={item.onClick}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex items-center justify-between px-4 py-3 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-[#404040] to-transparent" />

            {/* Menu Items - Section 3: Support */}
            <div className="py-1">
              {supportItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={idx}
                    onClick={item.onClick}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex items-center justify-between px-4 py-3 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-[#404040] to-transparent" />

            {/* Logout */}
            <div className="py-1">
              <motion.button
                onClick={() => { onLogout(); setOpen(false); }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-center justify-between px-4 py-3 text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} className="text-red-400 dark:text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
                  <span>Cerrar sesión</span>
                </div>
                <ChevronRight size={16} className="text-red-300 dark:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
