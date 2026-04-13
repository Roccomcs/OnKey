// frontend/src/pages/DashboardRedesigned.jsx
// Dashboard rediseñado - Premium, no genérico

import { AlertCircle, AlertTriangle, Plus, Search } from 'lucide-react';
import {
  BtnPrimary,
  Card,
  CardProperty,
  SearchInput,
  AlertCard,
  EmptyState,
  MetricCard,
  SectionHeader,
  Table,
  Badge,
  Separator,
} from '../components/ui/redesigned';
import { fmtCurrency, fmtDate, diffDays } from '../utils/helpers';

export function DashboardRedesigned({ properties, leases, tenants, setActive }) {
  // ─── Cálculos ─────────────────────────────────────────────────────────────
  
  const rentaTotal = properties.reduce((sum, p) => sum + (p.price || 0), 0);
  const ocupadas = properties.filter(p => p.status === 'ocupado').length;
  const ocupanciaPercent = properties.length > 0 ? Math.round((ocupadas / properties.length) * 100) : 0;

  // Alertas críticas (contratos que vencen en 7 días o menos)
  const alertasVencimiento = leases
    .filter(l => {
      const dias = diffDays(l.fecha_fin);
      return dias <= 7 && dias >= 0;
    })
    .sort((a, b) => diffDays(a.fecha_fin) - diffDays(b.fecha_fin))
    .slice(0, 3);

  const ventosHoy = leases.filter(l => diffDays(l.fecha_fin) === 0).length;

  // Propiedades sin inquilino (oportunidad)
  const propiedadesLibres = properties.filter(p => p.status === 'desocupado');

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-16">
      {/* ══════ HEADER ══════ */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-32 font-bold text-gray-100">Bienvenida 👋</h1>
          <p className="text-14 text-gray-600 mt-1">Status de tu inmobiliaria hoy</p>
        </div>
        <BtnPrimary onClick={() => setActive('properties')} className="flex gap-2">
          <Plus size={16} />
          Agregar propiedad
        </BtnPrimary>
      </div>

      {/* ══════ BÚSQUEDA ══════ */}
      <SearchInput placeholder="Buscar propiedad, inquilino, contrato..." />

      {/* ══════ SECCIÓN 1: ESTADO RÁPIDO (LO MÁS IMPORTANTE) ══════ */}
      <div>
        <SectionHeader title="Estado actual" description="Resumen en tiempo real" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Rentas activas"
            value={fmtCurrency(rentaTotal)}
            unit=""
            trend={12}
          />
          <MetricCard
            label="Vencimientos HOY"
            value={ventosHoy}
            unit={ventosHoy === 1 ? ' contrato' : ' contratos'}
            trend={undefined}
          />
          <MetricCard
            label="Ocupancía"
            value={ocupanciaPercent}
            unit="%"
            trend={5}
          />
        </div>
      </div>

      <Separator />

      {/* ══════ SECCIÓN 2: ALERTAS (ROJO = ACCIÓN) ══════ */}
      {(ventosHoy > 0 || alertasVencimiento.length > 0) && (
        <div>
          <SectionHeader title="⚠ Requiere atención" />
          <div className="space-y-3">
            {/* Vencidos HOY */}
          <AlertCard
            icon="🚨"
            title={`${ventosHoy} ${ventosHoy === 1 ? 'contrato' : 'contratos'} venció HOY`}
            description="Estos inquilinos necesitan renovar inmediatamente — no esperes"
            action="Renovar ahora"
            variant="error"
          />

            {/* Vencimientos próximos */}
            {alertasVencimiento.length > 0 &&
                  <AlertCard
                    key={lease.id}
                    icon="●"
                    title={`Vence en ${diffDays(lease.fecha_fin)} días`}
                    description={`${lease.nominatario} · Propiedad ${lease.propiedad_id}`}
                    action="Ver detalles"
                    variant="warning"
                  />}
          </div>
        </div>
      )}

      {ventosHoy === 0 && alertasVencimiento.length === 0 && (
        <div className="bg-green-600/5 border border-green-600/30 rounded-lg p-4 text-center">
          <p className="text-14 text-green-400 font-medium">✓ Todo en orden</p>
          <p className="text-12 text-green-400/60">Sin alertas — tu inmobiliaria está en bon estado</p>
        </div>
      )}

      <Separator />

      {/* ══════ SECCIÓN 3: OPORTUNIDADES ══════ */}
      {propiedadesLibres.length > 0 && (
        <div>
          <SectionHeader
            title={`${propiedadesLibres.length} ${propiedadesLibres.length === 1 ? 'propiedad' : 'propiedades'} desocupada`}
            description="Listos para alquilar"
            action={
              <BtnPrimary 
                onClick={() => setActive({ page: 'properties', filter: 'desocupado' })}
              >
                Ver todas
              </BtnPrimary>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propiedadesLibres.slice(0, 3).map(prop => (
              <CardProperty key={prop.id} property={prop} />
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* ══════ SECCIÓN 4: RESUMEN DE PROPIEDADES ══════ */}
      <div>
        <SectionHeader
          title={`${properties.length} propiedades`}
          description="Estado completo de tu portafolio"
          action={
            <BtnPrimary onClick={() => setActive('properties')}>
              Ver todas
            </BtnPrimary>
          }
        />

        {properties.length === 0 ? (
          <EmptyState
            icon="🏠"
            title="Todavía no hay propiedades"
            description="Empezá agregando tu primer inmueble. De ahí fluye todo: rentas, inquilinos, alertas, documentos."
            action={{
              label: 'Agregar primera propiedad',
              onClick: () => setActive('properties'),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.slice(0, 6).map(prop => (
              <CardProperty key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* ══════ SECCIÓN 5: TABLA DE CONTRATOS (si hay) ══════ */}
      {leases.length > 0 && (
        <div>
          <SectionHeader
            title={`${leases.length} contratos activos`}
            description="Los últimos cambios"
          />

          <Card>
            <Table
              headers={['Propiedad', 'Inquilino', 'Vencimiento', 'Renta']}
              rows={leases.slice(0, 10).map(lease => ({
                cells: [
                  <span className="font-medium text-gray-100">Prop #{lease.propiedad_id}</span>,
                  <span className="text-gray-300">{lease.nominatario}</span>,
                  <span
                    className={
                      diffDays(lease.fecha_fin) <= 7
                        ? 'text-red-500 font-medium'
                        : 'text-gray-300'
                    }
                  >
                    {fmtDate(lease.fecha_fin)}
                  </span>,
                  <span className="font-mono text-gray-300">${lease.renta_mensual?.toLocaleString()}</span>,
                ],
                actions: (
                  <button className="text-blue-400 text-12 hover:text-blue-300">
                    Ver →
                  </button>
                ),
              }))}
              actions
            />
          </Card>
        </div>
      )}
    </div>
  );
}
