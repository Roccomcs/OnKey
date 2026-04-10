// frontend/src/components/leases/LeaseFormModal.jsx
import { AlertTriangle } from "lucide-react";
import { Modal }                from "../ui/Modal";
import { Field, Input, Select } from "../ui/FormField";
import { DocumentsSection }     from "../ui/DocumentsSection";
import { useDocuments }         from "../../hooks/useDocuments";
import { AjusteSelector }       from "./ajusteSelector";

function LeaseDocuments({ leaseId }) {
  const docState = useDocuments("lease", leaseId);
  if (!leaseId) return (
    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
      Guardá el contrato primero para adjuntar documentos.
    </p>
  );
  return <DocumentsSection entityType="lease" entityId={leaseId} {...docState} />;
}

export function LeaseFormModal({
  open, onClose, editing, saving, formErr,
  form, setForm, onSave,
  properties, tenants, leases,
}) {
  // Solo propiedades vacantes o la actual al editar
  const propiedadesDisponibles = properties.filter(p =>
    p.status === "vacante" ||
    (editing && leases.find(l => l.id === editing)?.propertyId === p.id)
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar Contrato" : "Nuevo Contrato"}
      wide
    >
      <div className="space-y-4">
        {/* Partes */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Propiedad">
            <Select value={form.propertyId} onChange={e => setForm({ ...form, propertyId: e.target.value })}>
              <option value="">Seleccionar...</option>
              {propiedadesDisponibles.map(p => (
                <option key={p.id} value={p.id}>{p.address}</option>
              ))}
            </Select>
          </Field>
          <Field label="Inquilino">
            <Select value={form.tenantId} onChange={e => setForm({ ...form, tenantId: e.target.value })}>
              <option value="">Seleccionar...</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha inicio">
            <Input type="date" value={form.startDate}
              onChange={e => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <Field label="Fecha fin">
            <Input type="date" value={form.endDate}
              onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </Field>
        </div>

        {/* Renta */}
        <Field label="Renta mensual (ARS)">
          <Input type="text" inputMode="decimal" placeholder="Ej: 350000" value={form.rent}
            onChange={e => setForm({ ...form, rent: e.target.value.replace(/[^0-9.]/g, '') })} />
        </Field>

        {/* Cláusula de ajuste */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-700/30">
          <AjusteSelector
            tipoAjuste={form.tipoAjuste}
            onChange={v  => setForm({ ...form, tipoAjuste: v })}
            period={form.period}
            onPeriod={v  => setForm({ ...form, period: v })}
            increase={form.increase}
            onIncrease={v => setForm({ ...form, increase: v })}
            iclVariacion={form.iclVariacion ?? ""}
            onIclVariacion={v => setForm({ ...form, iclVariacion: v })}
            rentaBase={form.rent}
          />
        </div>

        {/* Estado — solo al editar */}
        {editing && (
          <Field label="Estado del contrato">
            <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="activo">Activo</option>
              <option value="vencido">Vencido</option>
              <option value="rescindido">Rescindido</option>
              <option value="renovado">Renovado</option>
            </Select>
          </Field>
        )}

        {/* Documentos — solo al editar */}
        {editing && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-4">
            <LeaseDocuments leaseId={editing} />
          </div>
        )}

        {/* Error */}
        {formErr && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{formErr}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button onClick={onSave} disabled={saving}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? "Guardando…" : (editing ? "Actualizar" : "Crear Contrato")}
          </button>
        </div>
      </div>
    </Modal>
  );
}