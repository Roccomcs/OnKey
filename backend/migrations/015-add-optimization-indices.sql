-- ================================================================
--  Migración: Agregar índices para optimización de queries
--  Ejecutar una sola vez en la base de datos
-- ================================================================

-- Índices para contratos (usados en propiedades, tenants, owners)
CREATE INDEX IF NOT EXISTS idx_contratos_propiedad 
  ON contratos(propiedad_id, estado_contrato);

CREATE INDEX IF NOT EXISTS idx_contratos_inquilino 
  ON contratos(inquilino_id, estado_contrato);

-- Índices para propiedades (usadas en searches)
CREATE INDEX IF NOT EXISTS idx_propiedades_tenant_activo 
  ON propiedades(tenant_id, activo);

-- Índices para personas (propietarios e inquilinos)
CREATE INDEX IF NOT EXISTS idx_personas_tenant_tipo 
  ON personas(tenant_id, tipo_persona, activo);

-- Índices para documents y photos
CREATE INDEX IF NOT EXISTS idx_property_photos_propiedad 
  ON property_photos(propiedad_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_documentos_entity 
  ON documentos(entity_type, entity_id, tenant_id);

-- Índices para suscripciones
CREATE INDEX IF NOT EXISTS idx_suscripciones_usuario_tenant 
  ON suscripciones(usuario_id, tenant_id, estado);

CREATE INDEX IF NOT EXISTS idx_suscripciones_mp_preapproval 
  ON suscripciones(mp_preapproval_id);

-- Índice para activities (usado en búsquedas de audit trail)
CREATE INDEX IF NOT EXISTS idx_activities_tenant_created 
  ON activities(tenant_id, createdAt DESC);

-- Índice para token blacklist (usado en validación de logout)
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires 
  ON token_blacklist(expires_at);

-- Índices para búsquedas de usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email_tenant 
  ON usuarios(email, tenant_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_tenant_activo 
  ON usuarios(tenant_id, activo);

-- Índice para búsquedas de índices históricos
CREATE INDEX IF NOT EXISTS idx_indices_historicos_tipo_periodo 
  ON indices_historicos(tipo, periodo DESC);
