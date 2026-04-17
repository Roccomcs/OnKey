-- Tabla de actividades (auditoría) para registro de acciones del usuario

CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT UNSIGNED NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  relatedId INT,
  relatedType VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_userId_createdAt (userId, createdAt DESC),
  INDEX idx_createdAt (createdAt DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tipos de actividades esperadas:
-- 'property_created', 'property_updated', 'property_deleted'
-- 'lease_created', 'lease_renewed', 'lease_ended', 'lease_rescinded'
-- 'tenant_created', 'tenant_updated'
-- 'owner_created', 'owner_updated'
-- 'alert_triggered'
