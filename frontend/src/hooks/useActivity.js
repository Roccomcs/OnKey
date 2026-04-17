// frontend/src/hooks/useActivity.js
// Hook para registrar y obtener actividades del usuario

import { useState, useCallback } from 'react';
import { apiCall } from '../utils/helpers';

export function useActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Obtener actividades ─────────────────────────────────────
  const getActivities = useCallback(async (limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall(`/activities?limit=${limit}`);
      setActivities(data || []);
      return data;
    } catch (err) {
      console.error('[useActivity] Error obteniendo actividades:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Registrar actividad ─────────────────────────────────────
  const logActivity = useCallback(async (type, title, description = null, relatedId = null, relatedType = null) => {
    try {
      const result = await apiCall('/activities', {
        method: 'POST',
        body: JSON.stringify({
          type,
          title,
          description,
          relatedId,
          relatedType
        })
      });
      return result;
    } catch (err) {
      console.error('[useActivity] Error registrando actividad:', err);
      return null;
    }
  }, []);

  return {
    activities,
    loading,
    error,
    getActivities,
    logActivity
  };
}
