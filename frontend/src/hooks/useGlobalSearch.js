// frontend/src/hooks/useGlobalSearch.js
import { useState, useEffect } from 'react';

export function useGlobalSearch(properties = [], leases = [], tenants = []) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState({ properties: [], leases: [], tenants: [] });

  // Escuchar Cmd+K
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
        if (!isOpen) setSearch('');
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen]);

  // Realizar búsqueda
  useEffect(() => {
    if (!search.trim()) {
      setResults({ properties: [], leases: [], tenants: [] });
      return;
    }

    const query = search.toLowerCase();

    const propResults = properties
      .filter(p =>
        p.direccion?.toLowerCase().includes(query) ||
        p.zona?.toLowerCase().includes(query) ||
        p.tipo?.toLowerCase().includes(query)
      )
      .slice(0, 5);

    const leaseResults = leases
      .filter(l =>
        l.nominatario?.toLowerCase().includes(query) ||
        String(l.propiedad_id).includes(query)
      )
      .slice(0, 5);

    const tenantResults = tenants
      .filter(t =>
        t.nombre?.toLowerCase().includes(query) ||
        t.email?.toLowerCase().includes(query) ||
        t.telefono?.includes(query)
      )
      .slice(0, 5);

    setResults({
      properties: propResults,
      leases: leaseResults,
      tenants: tenantResults,
    });
  }, [search, properties, leases, tenants]);

  return {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    results,
  };
}
