-- ================================================================
--  Migración: fotos de propiedad + moneda USD
--  Ejecutar en MySQL:  mysql -u root -p railway < migration_photos_currency.sql
-- ================================================================

USE railway;

-- 1. Agregar columna 'moneda' a propiedades (si aún no existe)
--    La columna ya estaba en el schema original con DEFAULT 'ARS',
--    pero si tu DB no la tiene por ser anterior, corre esto:
ALTER TABLE propiedades
  MODIFY COLUMN moneda VARCHAR(10) NOT NULL DEFAULT 'ARS';

-- 2. Agregar columna 'operacion' si no existe (en algunas versiones del schema falta)
ALTER TABLE propiedades
  ADD COLUMN IF NOT EXISTS operacion ENUM('alquiler','venta') NOT NULL DEFAULT 'alquiler';

-- 3. Agregar columnas de localidad/provincia/codigo_postal si no existen
ALTER TABLE propiedades
  ADD COLUMN IF NOT EXISTS localidad     VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS provincia     VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(20)  DEFAULT NULL;

-- 4. Crear tabla de fotos de propiedades
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
  KEY idx_photos_propiedad (propiedad_id),
  KEY idx_photos_tenant    (tenant_id),
  CONSTRAINT fk_photos_propiedad FOREIGN KEY (propiedad_id)
    REFERENCES propiedades (id) ON DELETE CASCADE,
  CONSTRAINT fk_photos_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
