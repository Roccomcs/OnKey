-- Migración: agregar campos de descripción a propiedades
-- Ejecutar: node railwayDB.js < backend/migrations/add_property_details.sql

ALTER TABLE propiedades
  ADD COLUMN IF NOT EXISTS m2           INT          NULL AFTER codigo_postal,
  ADD COLUMN IF NOT EXISTS habitaciones TINYINT      NULL AFTER m2,
  ADD COLUMN IF NOT EXISTS banos        TINYINT      NULL AFTER habitaciones,
  ADD COLUMN IF NOT EXISTS descripcion  TEXT         NULL AFTER banos;
