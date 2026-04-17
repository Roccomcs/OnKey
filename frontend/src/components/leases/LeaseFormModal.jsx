// frontend/src/components/leases/LeaseFormModal.jsx
import { AlertTriangle, Plus } from "lucide-react";
import { Modal }                from "../ui/Modal";
import { Field, Input, Select } from "../ui/FormField";
import { DocumentsSection }     from "../ui/DocumentsSection";
import { useDocuments }         from "../../hooks/useDocuments";
import { AjusteSelector }       from "./ajusteSelector";

const fmtInputPrice = (val) => {
  if (!val && val !== 0) return "";
  const digits = String(val).replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

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
  modo = "alquiler",
  onNavigate,
}) {
  const esVenta = modo === "venta";

  const propiedadesDisponibles = properties.filter(p =>
    p.status === "vacante" ||
    (editing && leases.find(l => l.id === editing)?.propertyId === p.id)
  );

  const handlePropertyChange = (e) => {
    const propId    = e.target.value;
    
    // Si selecciona opción de agregar propiedad
    if (propId === "ADD_NEW_PROPERTY") {
      onNavigate?.({ page: "properties" });
      return;
    }
    
    const propiedad = properties.find(p => String(p.id) === String(propId));
    const nuevoForm = { ...form, propertyId: propId };
    if (propiedad?.price) nuevoForm.rent = String(propiedad.price);
    setForm(nuevoForm);
  };

  const propiedadSeleccionada = form.propertyId
    ? properties.find(p => String(p.id) === String(form.propertyId))
    : null;

  const handleTenantChange = (e) => {
    const tenantId = e.target.value;
    
    // Si selecciona opción de agregar inquilino
    if (tenantId === "ADD_NEW_TENANT") {
      onNavigate?.({ page: "contacts" });
      return;
    }
    
    setForm({ ...form, tenantId });
  };

  const monedaProp    = propiedadSeleccionada?.moneda || "ARS";
  const labelPrecio   = esVenta
    ? `Precio de venta${monedaProp === "USD" ? " (USD)" : " (ARS)"}`
    : `Renta mensual${monedaProp === "USD" ? " (USD)" : " (ARS)"}`;
  const placeholderP  = monedaProp === "USD" ? "Ej: 120000" : "Ej: 350000";
  const labelInquilino = esVenta ? "Comprador" : "Inquilino";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing
        ? (esVenta ? "Editar Contrato de Venta" : "Editar Contrato de Alquiler")
        : (esVenta ? "Nuevo Contrato de Venta"  : "Nuevo Contrato de Alquiler")
      }
      wide
    >
      <div className="space-y-4">

        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
          esVenta
            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
        }`}>
          {esVenta ? "🏷️ Contrato de Venta" : "🏠 Contrato de Alquiler"}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Propiedad">
            <Select value={form.propertyId} onChange={handlePropertyChange}>
              <option value="">Seleccionar...</option>
              {propiedadesDisponibles.map(p => (
                <option key={p.id} value={p.id}>{p.address}</option>
              ))}
              <option value="ADD_NEW_PROPERTY" className="font-semibold text-blue-600">+ Agregar propiedad</option>
            </Select>
          </Field>
          <Field label={labelInquilino}>
            <Select value={form.tenantId} onChange={handleTenantChange}>
              <option value="">Seleccionar...</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
              <option value="ADD_NEW_TENANT" className="font-semibold text-blue-600">+ Agregar {esVenta ? "comprador" : "inquilino"}</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={esVenta ? "Fecha escritura / inicio" : "Fecha inicio"}>
            <Input type="date" value={form.startDate}
              onChange={e => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <Field label={esVenta ? "Fecha fin / posesión" : "Fecha fin"}>
            <Input type="date" value={form.endDate}
              onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </Field>
        </div>

        <Field label={labelPrecio}>
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              placeholder={placeholderP}
              value={fmtInputPrice(form.rent)}
              onChange={e => {
                const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                setForm({ ...form, rent: raw });
              }}
            />
            {propiedadSeleccionada?.price && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-[#2d2d2d] px-1.5 py-0.5 rounded pointer-events-none">
                lista: {propiedadSeleccionada.price} {monedaProp}
              </span>
            )}
          </div>
          {propiedadSeleccionada?.price && (
            <p className="text-[11px] text-blue-500 dark:text-blue-400 mt-1">
              ✓ Precio precargado desde la propiedad. Podés modificarlo.
            </p>
          )}
        </Field>

        {!esVenta && (
          <div className="border border-gray-200 dark:border-[#404040] rounded-xl p-4 bg-gray-50/50 dark:bg-[#1e1e1e]">
            <AjusteSelector
              tipoAjuste={form.tipoAjuste}
              onChange={v  => setForm({ ...form, tipoAjuste: v })}
              period={form.period}
              onPeriod={v  => setForm({ ...form, period: v })}
              increase={form.increase}
              onIncrease={v => setForm({ ...form, increase: v })}
              iclVariacion={form.iclVariacion ?? ""}
              onIclVariacion={v => setForm({ ...form, iclVariacion: v })}
              indiceBase={form.indiceBase ?? ""}
              onIndiceBase={v => setForm({ ...form, indiceBase: v })}
              rentaBase={form.rent}
            />
          </div>
        )}

        {editing && (
          <Field label="Estado del contrato">
            <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="activo">Activo</option>
              {!esVenta && <option value="vencido">Vencido</option>}
              <option value="rescindido">Rescindido</option>
              {!esVenta && <option value="renovado">Renovado</option>}
            </Select>
          </Field>
        )}

        {editing && (
          <div className="rounded-xl border border-gray-200 dark:border-[#404040] bg-gray-50 dark:bg-[#1e1e1e] p-4">
            <LeaseDocuments leaseId={editing} />
          </div>
        )}

        {formErr && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{formErr}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-[#404040] text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors">
            Cancelar
          </button>
          <button onClick={onSave} disabled={saving}
            className={`flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors ${
              esVenta ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
            }`}>
            {saving ? "Guardando…" : (editing ? "Actualizar" : esVenta ? "Crear Venta" : "Crear Alquiler")}
          </button>
        </div>
      </div>
    </Modal>
  );
}