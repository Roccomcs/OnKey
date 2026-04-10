import { Building2, Users, FileText, Bell, LayoutDashboard, Sun, Moon, LogOut, Settings, Zap, ChevronDown } from "lucide-react";
import { useState } from "react";

const NAV = [
  { id: "dashboard",     label: "Dashboard",   icon: LayoutDashboard },
  { id: "properties",    label: "Propiedades", icon: Building2 },
  { id: "contacts",      label: "Contactos",   icon: Users },
  { id: "leases",        label: "Contratos",   icon: FileText },
  { id: "notifications", label: "Alertas",     icon: Bell },
];

export function Sidebar({ active, setActive, alertCount, dark, toggleDark, user, tenant, onLogout, subscription }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  return (
    <aside className="w-60 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col h-screen sticky top-0">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {tenant?.nombre === 'Default Tenant' ? 'OnKey' : (tenant?.nombre || 'OnKey')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Gestión Inmobiliaria</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const badge    = id === "notifications" && alertCount > 0;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Icon size={16} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"} />
              {label}
              {badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {dark
            ? <Sun size={16} className="text-amber-400" />
            : <Moon size={16} className="text-gray-400" />
          }
          {dark ? "Modo Claro" : "Modo Oscuro"}
        </button>

        {/* User Card with Plan */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all border border-blue-200 dark:border-blue-800"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.nombre?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                {user?.nombre || 'Usuario'}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                {subscription?.plan_nombre || 'Sin plan'}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 dark:text-gray-500 transition-transform flex-shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50 overflow-hidden">
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  // TODO: Abrir modal de ajustes de cuenta
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Settings size={16} className="text-gray-400 dark:text-gray-500" />
                Ajustes de Cuenta
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  setActive("planes");
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
              >
                <Zap size={16} />
                Mejorar Plan
              </button>

              <div className="border-t border-gray-200 dark:border-gray-600" />

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  onLogout?.();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}