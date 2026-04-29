// ============================================================
//  backend/middleware/pagination.js
//  Middleware para agregar límites de paginación a queries
// ============================================================

/**
 * Middleware que agrega parámetros de paginación al request
 * Valida que page y size sean razonables
 *
 * Uso:
 *   router.get('/', pagination(20), handler)
 *   // Luego en handler: req.pagination = { page, size, offset }
 *
 * Query params:
 *   ?page=1&size=20
 */
export function pagination(defaultPageSize = 20, maxPageSize = 100) {
  return (req, res, next) => {
    let page = Math.max(1, parseInt(req.query.page) || 1);
    let size = parseInt(req.query.size) || defaultPageSize;
    
    // Validar límites
    if (size < 1) size = defaultPageSize;
    if (size > maxPageSize) size = maxPageSize;
    
    const offset = (page - 1) * size;
    
    req.pagination = {
      page,
      pageSize: size,
      offset,
      limit: size,
    };
    
    next();
  };
}

/**
 * Crea respuesta paginada consistente
 * @param {Array} data
 * @param {number} page
 * @param {number} pageSize
 * @param {number} total
 * @returns {Object}
 */
export function paginatedResponse(data, page, pageSize, total) {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
