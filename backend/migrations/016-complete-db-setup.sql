-- ================================================================
--  OnKey - Complete Database Setup & Migration Script
--  Ejecutar en MySQL para configurar base de datos completa
--  Crea: 1. Base de datos y tablas
--        2. Índices de optimización
--        3. Datos iniciales (plan Starter)
-- ================================================================

-- Usar base de datos railway (crear si no existe)
CREATE DATABASE IF NOT EXISTS railway
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE railway;

-- ================================================================
-- TABLAS PRINCIPALES (del schema base)
-- ================================================================

-- 1. TENANTS - Multiples organizaciones
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

-- 2. USUARIOS - Accounts with passwords
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
  KEY idx_usuarios_tenant (tenant_id),
  CONSTRAINT fk_usuarios_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TOKEN BLACKLIST - Logout management
CREATE TABLE IF NOT EXISTS token_blacklist (
  jti         VARCHAR(128)  NOT NULL,
  usuario_id  INT UNSIGNED  NOT NULL,
  expires_at  DATETIME      NOT NULL,
  PRIMARY KEY (jti),
  KEY idx_token_bl_usuario (usuario_id),
  KEY idx_token_blacklist_expires (expires_at),
  CONSTRAINT fk_tbl_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. PERSONAS - Owners and Tenants
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
  KEY idx_personas_tenant_tipo (tenant_id, tipo_persona, activo),
  CONSTRAINT fk_personas_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. PROPIEDADES - Properties/Real estate listings
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
  precio_lista    DECIMAL(12,2)           DEFAULT NULL,
  moneda          VARCHAR(3)     NOT NULL DEFAULT 'ARS',
  operacion       VARCHAR(20)    NOT NULL DEFAULT 'alquiler',
  localidad       VARCHAR(100)            DEFAULT NULL,
  provincia       VARCHAR(100)            DEFAULT NULL,
  m2              INT                     DEFAULT NULL,
  habitaciones    TINYINT                 DEFAULT NULL,
  banos           TINYINT                 DEFAULT NULL,
  descripcion     TEXT                    DEFAULT NULL,
  activo          TINYINT(1)     NOT NULL DEFAULT 1,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_propiedades_tenant (tenant_id),
  KEY idx_propiedades_tenant_activo (tenant_id, activo),
  CONSTRAINT fk_propiedades_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. CONTRATOS - Leases/Rental agreements
CREATE TABLE IF NOT EXISTS contratos (
  id                    INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  tenant_id             INT UNSIGNED   NOT NULL,
  propiedad_id          INT UNSIGNED   NOT NULL,
  inquilino_id          INT UNSIGNED   NOT NULL,
  propietario_id        INT UNSIGNED   NOT NULL,
  fecha_inicio          DATE           NOT NULL,
  fecha_fin             DATE           NOT NULL,
  monto_renta           DECIMAL(12,2)  NOT NULL,
  moneda                VARCHAR(3)     NOT NULL DEFAULT 'ARS',
  estado_contrato       ENUM('activo','finalizado','borrador','cancelado')
                        NOT NULL DEFAULT 'activo',
  indice_ajuste         VARCHAR(50)             DEFAULT NULL,
  tipo_ajuste           VARCHAR(20)    NOT NULL DEFAULT 'FIJO',
  periodo_ajuste        VARCHAR(20)             DEFAULT 'anual',
  porcentaje_ajuste     DECIMAL(5,2)            DEFAULT NULL,
  indice_base_fecha     DATE                    DEFAULT NULL,
  indice_base_valor     DECIMAL(10,4)           DEFAULT NULL,
  proxima_actualizacion DATE                    DEFAULT NULL,
  created_at            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contratos_tenant (tenant_id),
  KEY idx_contratos_propiedad (propiedad_id, estado_contrato),
  KEY idx_contratos_inquilino (inquilino_id, estado_contrato),
  CONSTRAINT fk_contratos_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_contratos_propiedad FOREIGN KEY (propiedad_id)
    REFERENCES propiedades (id) ON DELETE CASCADE,
  CONSTRAINT fk_contratos_inquilino FOREIGN KEY (inquilino_id)
    REFERENCES personas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. PROPERTY PHOTOS
CREATE TABLE IF NOT EXISTS property_photos (
  id            INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  tenant_id     INT UNSIGNED   NOT NULL,
  propiedad_id  INT UNSIGNED   NOT NULL,
  file_name     VARCHAR(255)   NOT NULL,
  mime_type     VARCHAR(100)   NOT NULL DEFAULT 'image/jpeg',
  file_size     INT UNSIGNED   NOT NULL DEFAULT 0,
  file_data     LONGBLOB       NOT NULL,
  orden         INT UNSIGNED   NOT NULL DEFAULT 0,
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_property_photos_propiedad (propiedad_id, tenant_id),
  KEY idx_property_photos_tenant (tenant_id),
  CONSTRAINT fk_property_photos_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. DOCUMENTOS
CREATE TABLE IF NOT EXISTS documentos (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  tenant_id    INT UNSIGNED   NOT NULL,
  entity_type  VARCHAR(30)    NOT NULL,
  entity_id    INT UNSIGNED   NOT NULL,
  file_name    VARCHAR(255)   NOT NULL,
  mime_type    VARCHAR(100)   NOT NULL,
  file_size    INT UNSIGNED   NOT NULL DEFAULT 0,
  file_data    LONGBLOB       NOT NULL,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_documentos_tenant (tenant_id),
  KEY idx_documentos_entity (entity_type, entity_id, tenant_id),
  CONSTRAINT fk_documentos_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. PLANES - Subscription plans
CREATE TABLE IF NOT EXISTS planes (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(100)    NOT NULL,
  activo           TINYINT(1)      NOT NULL DEFAULT 1,
  precio_mensual   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  max_propiedades  INT UNSIGNED             DEFAULT NULL,
  max_contratos    INT UNSIGNED             DEFAULT NULL,
  max_contactos    INT UNSIGNED             DEFAULT NULL,
  max_usuarios     INT UNSIGNED             DEFAULT NULL,
  mp_plan_id       VARCHAR(255)             DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_planes_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. SUSCRIPCIONES
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
  updated_at               DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_suscripciones_usuario_tenant (usuario_id, tenant_id, estado),
  KEY idx_suscripciones_mp_preapproval (mp_preapproval_id),
  CONSTRAINT fk_suscripciones_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_suscripciones_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_suscripciones_plan FOREIGN KEY (plan_id)
    REFERENCES planes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. ACTIVITIES LOG
CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT UNSIGNED NOT NULL,
  userId INT UNSIGNED NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  relatedId INT,
  relatedType VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  KEY idx_activities_tenant_created (tenant_id, createdAt DESC),
  KEY idx_activities_userid_created (userId, createdAt DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. INDICES HISTÓRICOS - Historical index values for adjustments
CREATE TABLE IF NOT EXISTS indices_historicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  periodo DATE NOT NULL,
  valor DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_indices_tipo_periodo (tipo, periodo),
  KEY idx_indices_historicos_tipo_periodo (tipo, periodo DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- DATOS INICIALES
-- ================================================================

-- Insert plan Starter
INSERT IGNORE INTO planes (nombre, activo, precio_mensual, max_propiedades, max_contratos, max_contactos, max_usuarios)
VALUES ('Starter', 1, 0, 5, 5, 10, 1);

-- ================================================================
-- ÍNDICES DE OPTIMIZACIÓN (FASE 1)
-- ================================================================

-- Índices para queries frecuentes (ya están en CREATE TABLE, pero duplicados para claridad)

-- Verificar que todas las tablas existen
SELECT 'Database setup completed successfully!' as status;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='railway';

-- ================================================================
-- Notas para el usuario:
-- 1. Ejecutar este script COMPLETO contra la BD production
-- 2. Verificar que todas las tablas se creen sin errores
-- 3. Backup de la BD ANTES de ejecutar en producción
-- 4. Tiempo estimado: < 5 segundos
-- 5. Sin downtime - tablas IF NOT EXISTS las crean solo si no existen
-- ================================================================
