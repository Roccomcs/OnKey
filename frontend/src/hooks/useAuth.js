import { useState, useCallback, useEffect } from 'react';

// Con el proxy de Vite configurado, usamos URL relativa.
// Esto evita cualquier problema de CORS en desarrollo.
import { API } from '../utils/helpers';
const API_BASE_URL = API;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken  = localStorage.getItem('authToken');
    const storedUser   = localStorage.getItem('authUser');
    const storedTenant = localStorage.getItem('authTenant');

    if (storedToken && storedUser && storedTenant) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setTenant(JSON.parse(storedTenant));
      } catch (err) {
        console.error('Error al restaurar auth:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('authTenant');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (tenantName, email, password) => {
    setError(null);
    setLoading(true);
    try {
      // 🔄 Limpiar datos anteriores antes de hacer login
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('authTenant');

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error('Respuesta no-JSON del servidor:', text.slice(0, 300));
        throw new Error(`Error del servidor (${response.status}): respuesta inesperada`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error al autenticar');
      }

      const { token: newToken, usuario, tenant: tenantInfo } = data;

      // ✅ Solo guardar si el login fue exitoso
      setToken(newToken);
      setUser(usuario);
      setTenant(tenantInfo);

      localStorage.setItem('authToken',  newToken);
      localStorage.setItem('authUser',   JSON.stringify(usuario));
      localStorage.setItem('authTenant', JSON.stringify(tenantInfo));

      return { token: newToken, usuario, tenant: tenantInfo };
    } catch (err) {
      const errorMsg = err.message || 'Error al autenticar';
      setError(errorMsg);
      // 🧹 Si hay error, limpiar también el estado
      setToken(null);
      setUser(null);
      setTenant(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('authTenant');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${storedToken}` },
        });
      } catch {
        // Si falla el request igual limpiamos localmente
      }
    }
    setUser(null);
    setTenant(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('authTenant');
  }, []);

  const register = useCallback(async (tenantName, email, password, nombre) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant: tenantName, email, password, nombre }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al registrar');
      return data;
    } catch (err) {
      setError(err.message || 'Error al registrar');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getToken          = useCallback(() => token, [token]);
  const isAuthenticated   = useCallback(() => !!token && !!user, [token, user]);
  const getAuthHeaders    = useCallback(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, [token]);

  return { user, tenant, token, loading, error, login, logout, register, getToken, isAuthenticated, getAuthHeaders };
}

export default useAuth;