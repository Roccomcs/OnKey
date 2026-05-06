import { useState, useEffect } from "react";
import { API } from "../utils/helpers";

export function useApi(endpoint, token = null) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = async () => {
    // Si no hay endpoint, no hacer fetch
    if (!endpoint) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Usar el token pasado como prop, o fallback a localStorage
      const authToken = token || localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log(`[useApi] Enviando petición a ${endpoint} CON token (primeros 50 caracteres):`, authToken.substring(0, 50));
      } else {
        console.warn(`[useApi] Enviando petición a ${endpoint} SIN token`);
      }

      const res = await fetch(`${API}${endpoint}`, {
        headers,
      });

      // 🔑 Si recibe 401, el token es inválido/expirado — limpiar localStorage
      // (No 403, porque 403 puede ser falta de suscripción, no error de autenticación)
      if (res.status === 401) {
        console.warn(`[useApi] Token inválido (401). Limpiando almacenamiento...`);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('authTenant');
        // Recargar la página para que useAuth reinicie sin datos viejos
        window.location.href = '/';
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      
      // Si la respuesta tiene estructura paginada { data, pagination }, extraer solo data
      const finalData = json?.data !== undefined ? json.data : json;
      setData(finalData);
    } catch (e) {
      setError(e.message);
      console.error(`[useApi] Error en ${endpoint}:`, e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [endpoint, token]);

  return { data, setData, loading, error, reload: load };
}