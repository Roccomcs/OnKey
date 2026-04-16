import { useState, createContext, useMemo, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
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

// Componente protegido para rutas autenticadas
function ProtectedRoute({ children, isAuthenticated, isLoading }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#1a1a1a]">
        <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : null;
}

// Componente de layout para la app autenticada
function AppLayout({ children, auth, dark, toggleDark, shared, activeAlerts, dismiss }) {
  const [active, setActiveRaw] = useState("dashboard");
  const [propFilter, setPropFilter] = useState("todos");
  const [leaseFilter, setLeaseFilter] = useState("activo");
  const navigate = useNavigate();
  const location = useLocation();

  // Sincronizar active con la ruta actual
  useEffect(() => {
    const path = location.pathname.replace("/", "");
    if (path === "dashboard" || path === "") setActiveRaw("dashboard");
    else if (path === "propiedades") setActiveRaw("properties");
    else if (path === "contactos") setActiveRaw("contacts");
    else if (path === "contratos") setActiveRaw("leases");
    else if (path === "alertas") setActiveRaw("notifications");
    else if (path === "planes") setActiveRaw("planes");
  }, [location]);

  const handleSetActive = (target) => {
    if (typeof target === "string") {
      setActiveRaw(target);
      const routeMap = {
        dashboard: "/dashboard",
        properties: "/propiedades",
        contacts: "/contactos",
        leases: "/contratos",
        notifications: "/alertas",
        planes: "/planes"
      };
      navigate(routeMap[target] || "/dashboard");
    } else {
      const { page, filter } = target;
      setActiveRaw(page);
      if (page === "properties" && filter) setPropFilter(filter);
      if (page === "leases" && filter) setLeaseFilter(filter);
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  return (
    <AuthContext.Provider value={auth}>
      <div className="flex min-h-screen bg-gray-50/80 dark:bg-[#1a1a1a] font-sans">
        <Sidebar
          active={active}
          setActive={handleSetActive}
          alertCount={activeAlerts?.length || 0}
          dark={dark}
          toggleDark={toggleDark}
          user={auth.user}
          tenant={auth.tenant}
          onLogout={handleLogout}
          subscription={shared.subscription}
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
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

export default function App() {
  const { dark, toggleDark } = useTheme();
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const verifiedStatus = useMemo(() => new URLSearchParams(window.location.search).get('verified'), []);

  const { data: properties, setData: setProperties, loading: lProps, error: eProps, reload: reloadProps } = useApi(auth.token ? "/properties" : null, auth.token);
  const { data: owners, setData: setOwners, loading: lOwners, error: eOwners, reload: reloadOwners } = useApi(auth.token ? "/owners" : null, auth.token);
  const { data: tenants, setData: setTenants, loading: lTenants, error: eTenants, reload: reloadTenants } = useApi(auth.token ? "/tenants" : null, auth.token);
  const { data: leases, setData: setLeases, loading: lLeases, error: eLeases, reload: reloadLeases } = useApi(auth.token ? "/leases" : null, auth.token);
  const { data: subscription, loading: lSub } = useApi(auth.token ? "/subscriptions/mi-plan" : null, auth.token);

  const { badgeCount, dismiss, activeAlerts } = useAlerts(leases);

  const shared = { properties, setProperties, owners, setOwners, tenants, setTenants, leases, setLeases, subscription };

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#1a1a1a]">
        <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  const dataLoading = lProps || lOwners || lTenants || lLeases || lSub;
  const dataError = eProps || eOwners || eTenants || eLeases;

  return (
    <Routes>
      {/* Landing page (pública) */}
      <Route
        path="/"
        element={
          auth.user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LandingPageModern
              onLoginClick={() => navigate("/iniciarSesion")}
              onSignupClick={() => navigate("/registrarse")}
              dark={dark}
              toggleDark={toggleDark}
            />
          )
        }
      />

      {/* Login */}
      <Route
        path="/iniciarSesion"
        element={
          auth.user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              onLoginSuccess={() => navigate("/dashboard")}
              onBackClick={() => navigate("/")}
              initialView="login"
              auth={auth}
              verifiedStatus={verifiedStatus}
            />
          )
        }
      />

      {/* Registro */}
      <Route
        path="/registrarse"
        element={
          auth.user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              onLoginSuccess={() => navigate("/dashboard")}
              onBackClick={() => navigate("/")}
              initialView="register"
              auth={auth}
              verifiedStatus={verifiedStatus}
            />
          )
        }
      />

      {/* Rutas protegidas - Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={!!auth.user} isLoading={auth.loading}>
            {dataLoading ? (
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Cargando datos…</p>
                </div>
              </div>
            ) : dataError ? (
              <ErrorBox
                message={dataError}
                onRetry={() => { reloadProps(); reloadOwners(); reloadTenants(); reloadLeases(); }}
              />
            ) : (
              <AppLayout auth={auth} dark={dark} toggleDark={toggleDark} shared={shared} activeAlerts={activeAlerts} dismiss={dismiss}>
                <Dashboard {...shared} setActive={() => {}} activeAlerts={activeAlerts} />
              </AppLayout>
            )}
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - Propiedades */}
      <Route
        path="/propiedades"
        element={
          <ProtectedRoute isAuthenticated={!!auth.user} isLoading={auth.loading}>
            {dataLoading ? (
              <div>Cargando...</div>
            ) : dataError ? (
              <ErrorBox message={dataError} onRetry={reloadProps} />
            ) : (
              <AppLayout auth={auth} dark={dark} toggleDark={toggleDark} shared={shared} activeAlerts={activeAlerts} dismiss={dismiss}>
                <Properties {...shared} />
              </AppLayout>
            )}
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - Contactos */}
      <Route
        path="/contactos"
        element={
          <ProtectedRoute isAuthenticated={!!auth.user} isLoading={auth.loading}>
            {dataLoading ? (
              <div>Cargando...</div>
            ) : dataError ? (
              <ErrorBox message={dataError} onRetry={reloadOwners} />
            ) : (
              <AppLayout auth={auth} dark={dark} toggleDark={toggleDark} shared={shared} activeAlerts={activeAlerts} dismiss={dismiss}>
                <Contacts {...shared} />
              </AppLayout>
            )}
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - Contratos */}
      <Route
        path="/contratos"
        element={
          <ProtectedRoute isAuthenticated={!!auth.user} isLoading={auth.loading}>
            {dataLoading ? (
              <div>Cargando...</div>
            ) : dataError ? (
              <ErrorBox message={dataError} onRetry={reloadLeases} />
            ) : (
              <AppLayout auth={auth} dark={dark} toggleDark={toggleDark} shared={shared} activeAlerts={activeAlerts} dismiss={dismiss}>
                <Leases {...shared} />
              </AppLayout>
            )}
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - Alertas */}
      <Route
        path="/alertas"
        element={
          <ProtectedRoute isAuthenticated={!!auth.user} isLoading={auth.loading}>
            {dataLoading ? (
              <div>Cargando...</div>
            ) : (
              <AppLayout auth={auth} dark={dark} toggleDark={toggleDark} shared={shared} activeAlerts={activeAlerts} dismiss={dismiss}>
                <Notifications {...shared} activeAlerts={activeAlerts} dismiss={dismiss} setActive={() => {}} />
              </AppLayout>
            )}
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - Planes */}
      <Route
        path="/planes"
        element={
          <ProtectedRoute isAuthenticated={!!auth.user} isLoading={auth.loading}>
            <AppLayout auth={auth} dark={dark} toggleDark={toggleDark} shared={shared} activeAlerts={activeAlerts} dismiss={dismiss}>
              <Planes token={auth.token} />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}