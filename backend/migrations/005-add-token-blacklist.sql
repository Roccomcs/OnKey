-- Migration 005: Token blacklist para invalidar JWTs en logout
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
