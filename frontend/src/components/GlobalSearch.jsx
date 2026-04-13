// frontend/src/components/GlobalSearch.jsx
// Modal de búsqueda global tipo Vercel/Linear

import { Search, Command } from 'lucide-react';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import { fmtCurrency, fmtDate, diffDays } from '../utils/helpers';

export function GlobalSearch({ properties, leases, tenants, onSelectProperty, onSelectLease }) {
  const { isOpen, setIsOpen, search, setSearch, results } = useGlobalSearch(
    properties,
    leases,
    tenants
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg 
            hover:border-gray-500 transition text-14 text-gray-400 hover:text-gray-300"
        >
          <Search size={16} />
          Buscar... <kbd className="ml-2 text-xs bg-gray-800 px-2 py-1 rounded">⌘K</kbd>
        </button>
      </div>
    );
  }

  const hasResults =
    results.properties.length > 0 || results.leases.length > 0 || results.tenants.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        {/* ══════ INPUT ══════ */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
          <Search size={18} className="text-gray-500" />
          <input
            autoFocus
            type="text"
            placeholder="Buscar propiedad, contrato, inquilino..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
            className="flex-1 bg-transparent border-none outline-none text-14 text-gray-100 placeholder-gray-500"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-400 text-12 font-medium"
          >
            ESC
          </button>
        </div>

        {/* ══════ RESULTADOS ══════ */}
        <div className="max-h-96 overflow-y-auto">
          {!hasResults && search ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <p className="text-14">No encontramos resultados para "{search}"</p>
            </div>
          ) : !search ? (
            <div className="px-4 py-8 text-center text-gray-600">
              <p className="text-14">Empezá a tipear para buscar...</p>
            </div>
          ) : (
            <>
              {/* Propiedades */}
              {results.properties.length > 0 && (
                <div className="border-b border-gray-700">
                  <div className="px-4 py-2 text-11 font-semibold text-gray-600 uppercase">
                    Propiedades
                  </div>
                  {results.properties.map(prop => (
                    <button
                      key={prop.id}
                      onClick={() => {
                        onSelectProperty?.(prop);
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 transition border-b border-gray-700/50 last:border-0"
                    >
                      <p className="text-14 font-medium text-gray-100">{prop.direccion}</p>
                      <p className="text-12 text-gray-500">
                        {prop.zona} • $ {fmtCurrency(prop.renta_mensual)}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* Contratos */}
              {results.leases.length > 0 && (
                <div className="border-b border-gray-700">
                  <div className="px-4 py-2 text-11 font-semibold text-gray-600 uppercase">
                    Contratos
                  </div>
                  {results.leases.map(lease => {
                    const dias = diffDays(lease.fecha_fin);
                    return (
                      <button
                        key={lease.id}
                        onClick={() => {
                          onSelectLease?.(lease);
                          setIsOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-700 transition border-b border-gray-700/50 last:border-0"
                      >
                        <p className="text-14 font-medium text-gray-100">
                          {lease.nominatario}
                        </p>
                        <p
                          className={`text-12 ${
                            dias <= 7 ? 'text-red-500' : dias <= 30 ? 'text-amber-500' : 'text-gray-500'
                          }`}
                        >
                          Vence {fmtDate(lease.fecha_fin)}
                          {dias <= 7 && ` (⚠ ${dias}d)`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Inquilinos */}
              {results.tenants.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-11 font-semibold text-gray-600 uppercase">
                    Inquilinos
                  </div>
                  {results.tenants.map(tenant => (
                    <div
                      key={tenant.id}
                      className="px-4 py-3 border-b border-gray-700/50 last:border-0 hover:bg-gray-700 transition cursor-default"
                    >
                      <p className="text-14 font-medium text-gray-100">{tenant.nombre}</p>
                      <p className="text-12 text-gray-500">
                        {tenant.email} • {tenant.telefono}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ══════ FOOTER ══════ */}
        <div className="px-4 py-3 border-t border-gray-700 text-12 text-gray-600 flex justify-between">
          <span>Filtra con <kbd className="bg-gray-700 px-1.5 rounded">↑↓</kbd></span>
          <span><kbd className="bg-gray-700 px-1.5 rounded">Enter</kbd> para seleccionar</span>
        </div>
      </div>
    </div>
  );
}
