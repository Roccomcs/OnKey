// ============================================================
//  backend/mappers.js  —  VERSIÓN ACTUALIZADA
//  Cambios respecto al original:
//    • mapLease soporta tipo_ajuste ICL/IPC/FIJO
//    • Se elimina parseIndiceAjuste (movida a rentCalc.js como parseLegacyIndiceAjuste)
//    • Se agregan proxima_actualizacion, tipo_ajuste, indice_base* al shape del lease
// ============================================================

// ─── MAPPERS: transforman filas de la BD al formato del frontend ─────────────

export function mapOwner(row) {
  return {
    id:         String(row.id),
    name:       `${row.nombre} ${row.apellido}`,
    email:      row.email,
    phone:      row.telefono || "",
    document:   row.documento_nro || "",
    properties: row.properties ? row.properties.split(",").map(String) : [],
  };
}

export function mapTenant(row) {
  return {
    id:       String(row.id),
    name:     `${row.nombre} ${row.apellido}`,
    email:    row.email,
    phone:    row.telefono || "",
    document: row.documento_nro || "",
    leaseId:  row.leaseId ? String(row.leaseId) : null,
  };
}

export function mapProperty(row) {
  return {
    id:      String(row.id),
    address: `${row.direccion}${row.numero ? ", " + row.numero : ""}`,
    type:    mapTipo(row.tipo),
    price:   Number(row.precio_lista),
    status:  row.estado === "alquilada" ? "ocupado" : "vacante",
    ownerId: String(row.id_propietario),
    leaseId: row.leaseId ? String(row.leaseId) : null,
  };
}

// ─── mapLease — soporta FIJO | ICL | IPC ─────────────────────
export function mapLease(row) {
  // ── Compatibilidad con filas viejas que solo tenían indice_ajuste (string) ──
  // Si la columna nueva tipo_ajuste no existe aún (filas legacy), inferimos FIJO
  const tipoAjuste = row.tipo_ajuste ?? "FIJO";

  // Para tipo FIJO usamos porcentaje_ajuste o caemos al legado
  let increase = Number(row.porcentaje_ajuste ?? 0);
  let period   = row.periodo_ajuste ?? "anual";

  // Fallback: parseo del string legado "10% trimestral" si las nuevas columnas son null
  if (tipoAjuste === "FIJO" && !row.porcentaje_ajuste && row.indice_ajuste) {
    const match = String(row.indice_ajuste).match(/^([\d.]+)%?\s*(trimestral|semestral|anual)?/i);
    if (match) {
      increase = Number(match[1]) || 6;
      period   = (match[2] || "anual").toLowerCase();
    }
  }

  return {
    id:         String(row.id),
    propertyId: String(row.propiedad_id),
    tenantId:   String(row.inquilino_id),
    startDate:  _fmtDate(row.fecha_inicio),
    endDate:    _fmtDate(row.fecha_fin),
    rent:       Number(row.monto_renta),

    // ── Ajuste ──
    tipoAjuste,                                        // "FIJO" | "ICL" | "IPC"
    increase,                                          // solo relevante para FIJO
    period,                                            // trimestral | semestral | anual

    // ── Índice base (snapshot al firmar) ──
    indiceBaseFecha: row.indice_base_fecha
      ? _fmtDate(row.indice_base_fecha)
      : null,
    indiceBaseValor: row.indice_base_valor
      ? parseFloat(row.indice_base_valor)
      : null,

    // ── Próxima actualización ──
    proximaActualizacion: row.proxima_actualizacion
      ? _fmtDate(row.proxima_actualizacion)
      : null,

    status: row.estado_contrato === "activo" ? "activo" : row.estado_contrato,
  };
}

// ─── Helpers privados ─────────────────────────────────────────
function _fmtDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value).slice(0, 10); // "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DD"
}

// ─── Traduce tipo del frontend al ENUM de la BD ───────────────
export function mapTipoDB(tipo) {
  const m = {
    "Departamento":    "departamento",
    "Local Comercial": "local_comercial",
    "Casa":            "casa",
    "Oficina":         "oficina",
    "Galpón":          "galpon",
    "Terreno":         "terreno",
  };
  return m[tipo] || "otro";
}

// ─── Traduce tipo de la BD al formato del frontend ───────────
export function mapTipo(tipo) {
  const m = {
    departamento:    "Departamento",
    local_comercial: "Local Comercial",
    casa:            "Casa",
    oficina:         "Oficina",
    galpon:          "Galpón",
    terreno:         "Terreno",
    otro:            "Otro",
  };
  return m[tipo] || tipo;
}

// ─── Descompone un nombre completo en nombre + apellido ───────
export function splitName(fullName) {
  const parts    = fullName.trim().split(" ");
  const apellido = parts.length > 1 ? parts.at(-1) : "";
  const nombre   = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0];
  return { nombre, apellido };
}