-- ================================================================
--  OnKey — Schema completo de base de datos
--  Ejecutar en MySQL local:
--    mysql -u root -p < backend/database.sql
--  O pegar directo en DBeaver / TablePlus / Workbench
-- ================================================================

CREATE DATABASE IF NOT EXISTS railway
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE railway;

-- ----------------------------------------------------------------
-- 1. tenants
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
  id        INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  nombre    VARCHAR(200)   NOT NULL,
  email     VARCHAR(255)   NOT NULL,
  plan      VARCHAR(50)    NOT NULL DEFAULT 'starter',
  activo    TINYINT(1)     NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tenants_nombre (nombre),
  UNIQUE KEY uq_tenants_email  (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 2. usuarios
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id                  INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  tenant_id           INT UNSIGNED   NOT NULL,
  email               VARCHAR(255)   NOT NULL,
  password_hash       VARCHAR(255)   NOT NULL,
  nombre              VARCHAR(100)   NOT NULL,
  apellido            VARCHAR(100)            DEFAULT NULL,
  dni                 VARCHAR(20)             DEFAULT NULL,
  rol                 VARCHAR(30)    NOT NULL DEFAULT 'admin',
  activo              TINYINT(1)     NOT NULL DEFAULT 1,
  email_verificado    TINYINT(1)     NOT NULL DEFAULT 0,
  last_login          DATETIME                DEFAULT NULL,
  token_verificacion  VARCHAR(128)            DEFAULT NULL,
  token_expira        DATETIME                DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  CONSTRAINT fk_usuarios_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 3. token_blacklist
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS token_blacklist (
  jti         VARCHAR(128)  NOT NULL,
  usuario_id  INT UNSIGNED  NOT NULL,
  expires_at  DATETIME      NOT NULL,
  PRIMARY KEY (jti),
  KEY idx_token_bl_usuario (usuario_id),
  CONSTRAINT fk_tbl_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 4. personas  (propietarios e inquilinos)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS personas (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  tenant_id       INT UNSIGNED  NOT NULL,
  tipo_persona    ENUM('propietario','inquilino','ambos') NOT NULL,
  nombre          VARCHAR(100)  NOT NULL,
  apellido        VARCHAR(100)           DEFAULT NULL,
  documento_tipo  VARCHAR(20)   NOT NULL DEFAULT 'DNI',
  documento_nro   VARCHAR(30)            DEFAULT NULL,
  telefono        VARCHAR(30)            DEFAULT NULL,
  email           VARCHAR(255)           DEFAULT NULL,
  activo          TINYINT(1)    NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_personas_email_tenant   (email, tenant_id),
  UNIQUE KEY uq_personas_doc_tenant     (documento_nro, tenant_id),
  KEY idx_personas_tenant (tenant_id),
  CONSTRAINT fk_personas_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 5. propiedades
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS propiedades (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  tenant_id       INT UNSIGNED   NOT NULL,
  id_propietario  INT UNSIGNED   NOT NULL,
  direccion       VARCHAR(255)   NOT NULL,
  numero          VARCHAR(50)             DEFAULT NULL,
  ciudad          VARCHAR(100)            DEFAULT NULL,
  codigo_postal   VARCHAR(20)             DEFAULT NULL,
  tipo            ENUM('departamento','local_comercial','casa',
                       'oficina','galpon','terreno','otro')
                  NOT NULL DEFAULT 'otro',
  estado          ENUM('disponible','alquilada')
                  NOT NULL DEFAULT 'disponible',
  precio_lista    DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  moneda          VARCHAR(10)    NOT NULL DEFAULT 'ARS',
  activo          TINYINT(1)     NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_prop_tenant (tenant_id),
  KEY idx_prop_propietario (id_propietario),
  CONSTRAINT fk_prop_tenant      FOREIGN KEY (tenant_id)
    REFERENCES tenants  (id) ON DELETE CASCADE,
  CONSTRAINT fk_prop_propietario FOREIGN KEY (id_propietario)
    REFERENCES personas (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 6. contratos
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contratos (
  id                     INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  tenant_id              INT UNSIGNED   NOT NULL,
  propiedad_id           INT UNSIGNED   NOT NULL,
  inquilino_id           INT UNSIGNED   NOT NULL,
  propietario_id         INT UNSIGNED   NOT NULL,
  fecha_inicio           DATE           NOT NULL,
  fecha_fin              DATE           NOT NULL,
  monto_renta            DECIMAL(12,2)  NOT NULL,
  moneda                 VARCHAR(10)    NOT NULL DEFAULT 'ARS',
  estado_contrato        ENUM('activo','vencido','rescindido',
                              'renovado','borrador')
                         NOT NULL DEFAULT 'activo',
  indice_ajuste          VARCHAR(100)            DEFAULT NULL,
  -- columnas nuevas (agregadas en migración posterior)
  tipo_ajuste            ENUM('FIJO','ICL','IPC')         DEFAULT 'FIJO',
  periodo_ajuste         ENUM('trimestral','cuatrimestral',
                              'semestral','anual')         DEFAULT 'anual',
  porcentaje_ajuste      DECIMAL(8,4)                     DEFAULT NULL,
  indice_base_fecha      DATE                             DEFAULT NULL,
  indice_base_valor      DECIMAL(15,4)                    DEFAULT NULL,
  proxima_actualizacion  DATE                             DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_contratos_tenant      (tenant_id),
  KEY idx_contratos_propiedad   (propiedad_id),
  KEY idx_contratos_inquilino   (inquilino_id),
  CONSTRAINT fk_contratos_tenant      FOREIGN KEY (tenant_id)
    REFERENCES tenants    (id) ON DELETE CASCADE,
  CONSTRAINT fk_contratos_propiedad   FOREIGN KEY (propiedad_id)
    REFERENCES propiedades (id) ON DELETE CASCADE,
  CONSTRAINT fk_contratos_inquilino   FOREIGN KEY (inquilino_id)
    REFERENCES personas    (id) ON DELETE RESTRICT,
  CONSTRAINT fk_contratos_propietario FOREIGN KEY (propietario_id)
    REFERENCES personas    (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 7. documentos
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documentos (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  tenant_id    INT UNSIGNED   NOT NULL,
  entity_type  VARCHAR(30)    NOT NULL,      -- 'lease' | 'property'
  entity_id    INT UNSIGNED   NOT NULL,
  file_name    VARCHAR(255)   NOT NULL,
  mime_type    VARCHAR(100)   NOT NULL,
  file_size    INT UNSIGNED   NOT NULL DEFAULT 0,
  file_data    LONGBLOB       NOT NULL,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_docs_tenant  (tenant_id),
  KEY idx_docs_entity  (entity_type, entity_id),
  CONSTRAINT fk_docs_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 8. indices_historicos
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS indices_historicos (
  id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  tenant_id  INT UNSIGNED    NOT NULL,
  tipo       ENUM('ICL','IPC') NOT NULL,
  periodo    DATE            NOT NULL,        -- primer día del mes
  valor      DECIMAL(15,4)   NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_indices (tenant_id, tipo, periodo),
  CONSTRAINT fk_indices_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 9. alertas  (notificaciones generales por contrato)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alertas (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  tenant_id    INT UNSIGNED   NOT NULL,
  contrato_id  INT UNSIGNED   NOT NULL,
  tipo         VARCHAR(50)    NOT NULL,
  titulo       VARCHAR(255)            DEFAULT NULL,
  descripcion  TEXT                    DEFAULT NULL,
  estado       VARCHAR(50)             DEFAULT NULL,
  fecha_evento DATETIME                DEFAULT NULL,
  fecha_envio  DATETIME                DEFAULT NULL,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
               ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_alertas_tenant   (tenant_id),
  KEY idx_alertas_contrato (contrato_id),
  CONSTRAINT fk_alertas_tenant_id   FOREIGN KEY (tenant_id)
    REFERENCES tenants   (id) ON DELETE CASCADE,
  CONSTRAINT fk_alertas_contrato_id FOREIGN KEY (contrato_id)
    REFERENCES contratos (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 10. alertas_actualizacion  (deduplicación del cron de ajuste)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alertas_actualizacion (
  id                  INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  contrato_id         INT UNSIGNED   NOT NULL,
  tipo_alerta         ENUM('HOY','15_DIAS','30_DIAS') NOT NULL,
  fecha_alerta        DATE           NOT NULL,
  monto_base          DECIMAL(12,2)           DEFAULT NULL,
  monto_proyectado    DECIMAL(12,2)           DEFAULT NULL,
  indice_actual_valor DECIMAL(15,4)           DEFAULT NULL,
  created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_alerta (contrato_id, tipo_alerta, fecha_alerta),
  CONSTRAINT fk_alertas_act_contrato FOREIGN KEY (contrato_id)
    REFERENCES contratos (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 11. planes
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS planes (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(100)    NOT NULL,
  activo           TINYINT(1)      NOT NULL DEFAULT 1,
  precio_mensual   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  max_propiedades  INT UNSIGNED             DEFAULT NULL,  -- NULL = ilimitado
  max_contratos    INT UNSIGNED             DEFAULT NULL,
  max_contactos    INT UNSIGNED             DEFAULT NULL,
  max_usuarios     INT UNSIGNED             DEFAULT NULL,
  mp_plan_id       VARCHAR(255)             DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_planes_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 12. suscripciones
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suscripciones (
  id                       INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  usuario_id               INT UNSIGNED   NOT NULL,
  tenant_id                INT UNSIGNED   NOT NULL,
  plan_id                  INT UNSIGNED   NOT NULL,
  fecha_inicio             DATE           NOT NULL,
  fecha_fin                DATE           NOT NULL,
  fecha_renovacion_proximo DATE                    DEFAULT NULL,
  ciclo_facturacion        ENUM('mensual','anual') NOT NULL DEFAULT 'mensual',
  estado                   ENUM('activo','pendiente','cancelado')
                           NOT NULL DEFAULT 'activo',
  renovacion_automatica    TINYINT(1)     NOT NULL DEFAULT 0,
  mp_preapproval_id        VARCHAR(255)            DEFAULT NULL,
  created_at               DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_subs_usuario (usuario_id),
  KEY idx_subs_tenant  (tenant_id),
  CONSTRAINT fk_subs_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_subs_tenant  FOREIGN KEY (tenant_id)
    REFERENCES tenants  (id) ON DELETE CASCADE,
  CONSTRAINT fk_subs_plan    FOREIGN KEY (plan_id)
    REFERENCES planes   (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 13. pagos
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  suscripcion_id  INT UNSIGNED   NOT NULL,
  usuario_id      INT UNSIGNED   NOT NULL,
  tenant_id       INT UNSIGNED   NOT NULL,
  monto           DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  estado          ENUM('completado','pendiente','fallido')
                  NOT NULL DEFAULT 'completado',
  transaccion_id  VARCHAR(255)            DEFAULT NULL,
  fecha_pago      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pagos_usuario     (usuario_id),
  KEY idx_pagos_suscripcion (suscripcion_id),
  CONSTRAINT fk_pagos_suscripcion FOREIGN KEY (suscripcion_id)
    REFERENCES suscripciones (id) ON DELETE CASCADE,
  CONSTRAINT fk_pagos_usuario     FOREIGN KEY (usuario_id)
    REFERENCES usuarios      (id) ON DELETE CASCADE,
  CONSTRAINT fk_pagos_tenant      FOREIGN KEY (tenant_id)
    REFERENCES tenants       (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
--  DATOS INICIALES — Planes
--  (necesarios para que el registro funcione)
-- ================================================================
INSERT IGNORE INTO planes
  (nombre, activo, precio_mensual, max_propiedades, max_contratos, max_contactos, max_usuarios, mp_plan_id)
VALUES
  -- Starter (gratuito, límites bajos)
  ('Starter', 1, 0.00,  5,  5,  10,  1, NULL),
  -- Pro (pago)
  ('Pro',     1, 9999.00, 50, 50, 100,  5, NULL),
  -- Enterprise (ilimitado — NULLs)
  ('Enterprise', 1, 24999.00, NULL, NULL, NULL, NULL, NULL);
