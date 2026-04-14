import { useState, createContext, useMemo, useEffect } from "react";
import { Sidebar }       from "./components/layout/Sidebar";
import { UserMenu }      from "./components/layout/UserMenu";
import { DashboardRedesigned as Dashboard }     from "./pages/DashboardRedesigned";
import { Properties }    from "./pages/Properties";
import { Contacts }      from "./pages/Contacts";
import { Leases }        from "./pages/Leases";
import { Notifications } from "./pages/Notifications";
import { ErrorBox }      from "./components/ui/Errorbox";
import { useApi }        from "./hooks/useApi";
import { useTheme }      from "./hooks/useTheme";
import { useAlerts }     from "./hooks/useAlerts";
import { useAuth }       from "./hooks/useAuth";
import Login             from "./pages/Login";
import Planes            from "./pages/planes";
import LandingPageModern from "./pages/LandingPageModern";

// AuthContext para acceso global a autenticación
export const AuthContext = createContext(null);

export default function App() {
  const [active,      setActiveRaw] = useState("dashboard");
  const [propFilter,  setPropFilter] = useState("todos");
  const [leaseFilter, setLeaseFilter] = useState("activo");
  const [currentPage, setCurrentPage] = useState("landing"); // "landing" | "login" | "app"
  const { dark, toggleDark } = useTheme();

  const auth = useAuth();

  // Calcular verifiedStatus solo una vez para evitar re-renders infinitos
  const verifiedStatus = useMemo(() => new URLSearchParams(window.location.search).get('verified'), []);

  // Sincronizar currentPage con auth.user - evita ciclo infinito
  useEffect(() => {
    if (auth.user && currentPage !== "app") {
      setCurrentPage("app");
    } else if (!auth.user && currentPage === "app") {
      setCurrentPage("landing");
    }
  }, [auth.user, currentPage]);

  const { data: properties, setData: setProperties, loading: lProps,   error: eProps,   reload: reloadProps }   = useApi(auth.token ? "/properties" : null, auth.token);
  const { data: owners,     setData: setOwners,     loading: lOwners,  error: eOwners,  reload: reloadOwners }  = useApi(auth.token ? "/owners"     : null, auth.token);
  const { data: tenants,    setData: setTenants,    loading: lTenants, error: eTenants, reload: reloadTenants } = useApi(auth.token ? "/tenants"    : null, auth.token);
  const { data: leases,     setData: setLeases,     loading: lLeases,  error: eLeases,  reload: reloadLeases }  = useApi(auth.token ? "/leases"     : null, auth.token);
  const { data: subscription, loading: lSub } = useApi(auth.token ? "/subscriptions/mi-plan" : null, auth.token);

  const { badgeCount, dismiss, activeAlerts } = useAlerts(leases);

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#1a1a1a]">
        <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  // Landing page pública (sin autenticación)
  if (currentPage === "landing") {
    return (
      <LandingPageModern 
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        dark={dark}
        toggleDark={toggleDark}
      />
    );
  }

  // Página de login
  if (currentPage === "login") {
    return (
      <Login
        onLoginSuccess={() => setCurrentPage("app")}
        onBackClick={() => setCurrentPage("landing")}
        initialView="login"
        auth={auth}
        verifiedStatus={verifiedStatus}
      />
    );
  }

  // Página de signup/registro
  if (currentPage === "signup") {
    return (
      <Login
        onLoginSuccess={() => setCurrentPage("app")}
        onBackClick={() => setCurrentPage("landing")}
        initialView="register"
        auth={auth}
        verifiedStatus={verifiedStatus}
      />
    );
  }

  // Si el usuario se desautentica, vuelve a landing
  if (!auth.user) {
    setCurrentPage("landing");
    return null;
  }

  const dataLoading = lProps || lOwners || lTenants || lLeases;
  const dataError   = eProps || eOwners || eTenants || eLeases;

  const handleSetActive = (target) => {
    if (typeof target === "string") {
      setActiveRaw(target);
    } else {
      const { page, filter } = target;
      setActiveRaw(page);
      if (page === "properties" && filter) setPropFilter(filter);
      if (page === "leases"     && filter) setLeaseFilter(filter);
    }
  };

  const handleLogout = () => {
    auth.logout();
  };

  const shared = { properties, setProperties, owners, setOwners, tenants, setTenants, leases, setLeases };

  if (dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#1a1a1a]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Cargando datos…</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#1a1a1a] p-8">
        <div className="max-w-sm w-full space-y-4">
          <ErrorBox
            message={dataError}
            onRetry={() => { reloadProps(); reloadOwners(); reloadTenants(); reloadLeases(); }}
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Verificá que el servidor esté corriendo en{" "}
            <code className="bg-gray-100 dark:bg-[#262626] px-1 rounded">
              {import.meta.env.VITE_API_URL || "http://localhost:3001"}
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <div className="flex min-h-screen bg-gray-50/80 dark:bg-[#1a1a1a] font-sans">
        <Sidebar
          active={active}
          setActive={handleSetActive}
          alertCount={badgeCount}
          dark={dark}
          toggleDark={toggleDark}
          user={auth.user}
          tenant={auth.tenant}
          onLogout={handleLogout}
          subscription={subscription}
        />
        <main className="flex-1 flex flex-col overflow-auto">
          {/* Header con UserMenu */}
          <div className="sticky top-0 z-40 bg-white dark:bg-[#1a1a1a] backdrop-blur-sm bg-white/80 dark:bg-[#1a1a1a]/80">
            <div className="px-6 py-1 flex justify-end">
              <UserMenu
                user={auth.user}
                dark={dark}
                toggleDark={toggleDark}
                onLogout={handleLogout}
                onSelectPlanes={() => handleSetActive("planes")}
              />
            </div>
          </div>
          
          {/* Contenido */}
          <div className="flex-1 overflow-auto">
            <div className="px-8 py-3">
              {active === "dashboard"     && <Dashboard     {...shared} setActive={handleSetActive} activeAlerts={activeAlerts} />}
              {active === "properties"    && <Properties    {...shared} initialFilter={propFilter} />}
              {active === "contacts"      && <Contacts      {...shared} />}
              {active === "leases"        && <Leases        {...shared} initialTab={leaseFilter} />}
              {active === "notifications" && <Notifications {...shared} activeAlerts={activeAlerts} dismiss={dismiss} setActive={handleSetActive} />}
              {active === "planes"        && <Planes token={auth.token} />}
            </div>
          </div>
        </main>
      </div>
    </AuthContext.Provider>
  );
}