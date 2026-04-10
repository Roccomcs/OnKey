// frontend/src/hooks/useIndice.js
import { useState, useEffect, useCallback, useRef } from "react";
import { apiCall } from "../utils/helpers";

export function useIndice(tipo) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (!tipo || tipo === "FIJO") {
      setRows([]);
      setError(null);
      return;
    }

    // Cancelar request anterior si existe
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Cache-buster para evitar respuestas cacheadas por el navegador
      const ts = Date.now();
      const data = await apiCall(`/indices/${tipo}?_t=${ts}`, {
        signal: controller.signal,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.name === "AbortError") return; // request cancelado intencionalmente
      setError(e.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tipo]);

  useEffect(() => {
    load();
    return () => {
      // Cleanup: cancelar request al desmontar o cambiar tipo
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [load]);

  return { rows, loading, error, reload: load };
}