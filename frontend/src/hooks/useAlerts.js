import { useState, useEffect, useCallback } from "react";
import { diffDays, getAlertLevel } from "../utils/helpers";

const STORAGE_KEY = "onkey_dismissed_alerts";

function readDismissed() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeDismissed(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function useAlerts(leases) {
  const [dismissed, setDismissed] = useState(readDismissed);

  useEffect(() => {
    writeDismissed(dismissed);
  }, [dismissed]);

  // dismiss(contractId, levelLabel) — pasar null como levelLabel para reabrir
  const dismiss = useCallback((contractId, levelLabel) => {
    setDismissed(prev => {
      if (levelLabel === null) {
        // Reabrir: eliminar del mapa de descartadas
        const next = { ...prev };
        delete next[contractId];
        return next;
      }
      return { ...prev, [contractId]: levelLabel };
    });
  }, []);

  const activeAlerts = leases
    .filter(l => l.status === "activo")
    .map(l => {
      const days  = diffDays(l.endDate);
      const level = getAlertLevel(days);
      if (!level) return null;
      const lastDismissedLabel = dismissed[l.id];
      const isDismissed = lastDismissedLabel === level.label;
      return { contractId: l.id, level, days, isDismissed };
    })
    .filter(Boolean);

  const badgeCount = activeAlerts.filter(a => !a.isDismissed).length;

  return { dismissed, dismiss, badgeCount, activeAlerts };
}
