// ============================================================
//  backend/middleware/fileUpload.js
//  Middleware centralizado para upload de archivos
//  Incluye: sanitización, magic bytes validation, límites
// ============================================================

import multer from 'multer';
import path from 'path';

/**
 * Sanitiza nombre de archivo
 * - Quita path traversal
 * - Quita caracteres especiales
 * - Limita a 255 caracteres
 * @param {string} filename
 * @returns {string}
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'archivo';
  
  // Extrae solo el nombre base (sin carpetas)
  const basename = path.basename(filename);
  
  // Quita caracteres especiales, deja solo alphanuméricos, punto, guión, guión bajo
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255);
  
  return sanitized || 'archivo';
}

/**
 * Magic bytes (file signatures) para validar contenido real
 * https://en.wikipedia.org/wiki/List_of_file_signatures
 */
const MAGIC_BYTES = {
  // Imágenes
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // Más verificación necesaria
  
  // PDF
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
};

/**
 * Verifica magic bytes del archivo
 * @param {Buffer} buffer
 * @param {string} expectedMimetype
 * @returns {boolean}
 */
export function validateMagicBytes(buffer, expectedMimetype) {
  if (!buffer || buffer.length === 0) return false;
  
  const signature = MAGIC_BYTES[expectedMimetype];
  if (!signature) return true; // Si no está en la lista, permitir (pero idealmente agregar)
  
  // Compara los primeros N bytes
  return signature.every((byte, index) => buffer[index] === byte);
}

/**
 * Crea middleware multer para upload de imágenes
 * @param {Object} options
 * @returns {multer middleware}
 */
export function createImageUploadMiddleware(options = {}) {
  const {
    maxFiles = 20,
    maxFileSize = 8 * 1024 * 1024, // 8 MB
  } = options;
  
  const storage = multer.memoryStorage();
  
  return multer({
    storage,
    limits: { fileSize: maxFileSize },
    fileFilter: (req, file, cb) => {
      // Validar mimetype
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'));
      }
      
      // Validar magic bytes
      if (!validateMagicBytes(file.buffer, file.mimetype)) {
        return cb(new Error('Archivo de imagen inválido (contenido no coincide con extensión)'));
      }
      
      cb(null, true);
    },
  }).array('photos', maxFiles);
}

/**
 * Crea middleware multer para upload de documentos
 * @param {Object} options
 * @returns {multer middleware}
 */
export function createDocumentUploadMiddleware(options = {}) {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10 MB
  } = options;
  
  const storage = multer.memoryStorage();
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
  
  return multer({
    storage,
    limits: { fileSize: maxFileSize },
    fileFilter: (req, file, cb) => {
      // Validar mimetype
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Tipo no permitido. Solo PDF, PNG o JPG'));
      }
      
      // Validar magic bytes
      if (!validateMagicBytes(file.buffer, file.mimetype)) {
        return cb(new Error('Archivo inválido (contenido no coincide con tipo)'));
      }
      
      cb(null, true);
    },
  }).single('file');
}
