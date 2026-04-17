import { Percent } from "lucide-react";
import { useCurrentICL } from "../../hooks/useCurrentICL";

/**
 * Componente que muestra el ajuste dinámico de ICL
 * Calcula: (ICL_actual - indiceBase) / indiceBase * 100
 */
export function AjusteDinamico({ lease }) {
  const { valor: iclActual } = useCurrentICL();

  // Solo mostrar para contratos ICL con índice base
  if (lease.tipoAjuste !== "ICL" || !lease.indiceBaseValor) {
    return null;
  }

  // Si no hay ICL actual, no mostrar
  if (!iclActual) {
    return null;
  }

  // Calcular el porcentaje de ajuste acumulado
  const porcentajeAjuste = ((iclActual - lease.indiceBaseValor) / lease.indiceBaseValor) * 100;

  return (
    <span className="flex items-center gap-1">
      <Percent size={12} />
      {porcentajeAjuste > 0 ? "+" : ""}{porcentajeAjuste.toFixed(2)}% {lease.period}
    </span>
  );
}
