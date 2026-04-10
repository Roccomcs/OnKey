import { AlertTriangle } from "lucide-react";

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
      <AlertTriangle size={28} className="text-red-400 mx-auto mb-2" />
      <p className="font-medium text-red-700 dark:text-red-400">Error al cargar datos</p>
      <p className="text-sm text-red-500 dark:text-red-400 mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-sm font-medium rounded-xl hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}