// frontend/src/pages/planes.jsx
import { useState, useEffect } from 'react';
import { API } from '../utils/helpers';

const FEATURES = {
  Starter: [                           // ← era "Gratis"
    '✓ Hasta 10 propiedades',
    '✓ Hasta 10 contratos activos',
    '✓ 1 usuario',
    '✗ Reportes',
    '✗ Automatizaciones',
  ],
  Pro: [
    '✓ Hasta 50 propiedades',
    '✓ Hasta 50 contratos activos',
    '✓ Hasta 200 contactos',
    '✓ Hasta 5 usuarios',
    '✓ Reportes incluidos',
    '✗ Automatizaciones',
  ],
  Premium: [                           // ← era "Enterprise"
    '✓ Hasta 500 propiedades',
    '✓ Contratos ilimitados',
    '✓ Contactos ilimitados',
    '✓ Hasta 20 usuarios',
    '✓ Reportes incluidos',
    '✓ Automatizaciones',
  ],
};

// El token viene como prop desde App.jsx (que ya lo tiene de useAuth)
export default function Planes({ token }) {
  const [planes, setPlanes]         = useState([]);
  const [planActual, setPlanActual] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [upgrading, setUpgrading]   = useState(null);
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Detectar redirect de MercadoPago con ?mp_status=approved en la URL raíz
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mpStatus = params.get('mp_status') || params.get('status');
    if (mpStatus === 'approved' || mpStatus === 'success') {
      setSuccessMsg('¡Pago recibido! Tu plan se activará en unos minutos.');
      // Limpiar query string sin recargar
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      // Carga los planes (endpoint público)
      try {
        const planesRes = await fetch(`${API}/subscriptions/planes`);
        const planesData = await planesRes.json();
        if (!planesRes.ok) throw new Error(planesData.error || `Error ${planesRes.status}`);
        setPlanes(Array.isArray(planesData) ? planesData : []);
      } catch (err) {
        console.error('[planes] Error cargando planes:', err);
        setError(`Error al cargar los planes: ${err.message}`);
      } finally {
        setLoading(false);
      }

      // Carga el plan actual del usuario (independiente — si falla no rompe los planes)
      try {
        const miPlanRes = await fetch(`${API}/subscriptions/mi-plan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (miPlanRes.ok) {
          const miPlan = await miPlanRes.json();
          setPlanActual(miPlan);
        }
      } catch (err) {
        console.warn('[planes] No se pudo cargar el plan actual:', err.message);
      }
    }

    fetchData();
  }, [token]);

  const handleUpgrade = async (plan) => {
    setError('');
    setUpgrading(plan.id);
    try {
      const res = await fetch(`${API}/subscriptions/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar el pago');

      // Redirigir a MercadoPago — MP vuelve a la raíz del sitio con ?mp_status=...
      window.location.href = data.init_point;
    } catch (err) {
      setError(err.message);
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Planes y Precios
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Elegí el plan que se adapte a tu inmobiliaria
        </p>
      </div>

      {/* Mensajes */}
      {successMsg && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm mb-6 text-center">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-6 text-center">
          {error}
        </div>
      )}

      {/* Grilla de planes */}
      {planes.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          No hay planes disponibles en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planes.map((plan) => {
            const esPlanActual = planActual?.plan_nombre === plan.nombre;
            const esPro        = plan.nombre === 'Pro';
            const features     = FEATURES[plan.nombre] || [];

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 flex flex-col transition-shadow ${
                  esPro
                    ? 'border-violet-500 shadow-lg shadow-violet-100 dark:shadow-violet-900/30'
                    : 'border-gray-200 dark:border-gray-700 shadow-sm'
                } bg-white dark:bg-gray-800`}
              >
                {/* Badge popular */}
                {esPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Más popular
                    </span>
                  </div>
                )}

                {/* Nombre */}
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  {plan.nombre}
                </h2>

                {/* Precio */}
                <div className="mb-4">
                  {plan.precio_mensual === 0 ? (
                    <span className="text-3xl font-extrabold text-gray-700 dark:text-gray-200">Gratis</span>
                  ) : plan.precio_mensual ? (
                    <div>
                      <span className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
                        ${Number(plan.precio_mensual).toLocaleString('es-AR')}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">/mes</span>
                    </div>
                  ) : (
                    <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">A consultar</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {features.map((f, i) => (
                    <li
                      key={i}
                      className={`text-sm ${
                        f.startsWith('✗')
                          ? 'text-gray-400 dark:text-gray-600'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Botón */}
                {esPlanActual ? (
                  <div className="w-full py-2 text-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800">
                    ✓ Plan actual
                  </div>
                ) : plan.precio_mensual === 0 ? (
                  <div className="w-full py-2 text-center bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-lg text-sm border border-gray-200 dark:border-gray-600">
                    Plan de inicio
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={!!upgrading}
                    className={`w-full py-2 rounded-lg text-sm font-semibold text-white transition ${
                      esPro
                        ? 'bg-violet-600 hover:bg-violet-700'
                        : 'bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {upgrading === plan.id ? 'Redirigiendo…' : `Actualizar a ${plan.nombre}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pie */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
        Los pagos se procesan de forma segura a través de MercadoPago.
        Podés cancelar cuando quieras.
      </p>
    </div>
  );
}