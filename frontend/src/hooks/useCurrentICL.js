import { useState, useEffect } from "react";
import { apiCall } from "../utils/helpers";

/**
 * Hook para obtener el valor actual del ICL desde la base de datos
 * Devuelve: { valor, periodo, loading, error }
 */
export function useCurrentICL() {
  const [valor, setValor] = useState(null);
  const [periodo, setPeriodo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchICL = async () => {
      setLoading(true);
      setError(null);
      try {
        // GET /indices/ICL devuelve los últimos 24 períodos, el primero es el más reciente
        const data = await apiCall(`/indices/ICL`);
        if (data && data.length > 0) {
          setValor(data[0].valor);
          setPeriodo(data[0].periodo);
        } else {
          setError("No hay datos de ICL disponibles");
        }
      } catch (err) {
        setError(err.message || "Error consultando ICL");
      } finally {
        setLoading(false);
      }
    };

    fetchICL();
  }, []);

  return { valor, periodo, loading, error };
}
