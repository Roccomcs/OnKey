import { useState, useCallback } from 'react';

/**
 * Hook para manejar CSRF tokens en el frontend
 * Almacena y adjunta el token a cada request de escritura
 */
export function useCSRFToken() {
  const [csrfToken, setCSRFToken] = useState(() => {
    // Cargar token del localStorage al iniciar
    return localStorage.getItem('csrfToken') || null;
  });

  /**
   * Guarda el token CSRF después del login
   * @param {string} token - Token CSRF devuelto por el servidor
   */
  const saveToken = useCallback((token) => {
    if (token) {
      localStorage.setItem('csrfToken', token);
      setCSRFToken(token);
    }
  }, []);

  /**
   * Limpia el token al logout
   */
  const clearToken = useCallback(() => {
    localStorage.removeItem('csrfToken');
    setCSRFToken(null);
  }, []);

  /**
   * Adjunta el CSRF token a un fetch request
   * @param {string} url - URL del endpoint
   * @param {Object} options - Opciones de fetch
   * @returns {Promise} Resultado del fetch
   */
  const fetchWithCSRF = useCallback(async (url, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    
    // No adjuntar CSRF en GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return fetch(url, options);
    }

    // Adjuntar token CSRF a headers para POST, PUT, DELETE, PATCH
    const headers = {
      ...options.headers,
      'X-CSRF-Token': csrfToken,
    };

    return fetch(url, {
      ...options,
      method,
      headers,
    });
  }, [csrfToken]);

  return {
    csrfToken,
    saveToken,
    clearToken,
    fetchWithCSRF,
  };
}

/**
 * Hook alternativo que usa JSON body con _csrf
 * (En caso de que no se pueda usar headers)
 */
export function useCSRFTokenBody() {
  const [csrfToken, setCSRFToken] = useState(() => {
    return localStorage.getItem('csrfToken') || null;
  });

  const saveToken = useCallback((token) => {
    if (token) {
      localStorage.setItem('csrfToken', token);
      setCSRFToken(token);
    }
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem('csrfToken');
    setCSRFToken(null);
  }, []);

  const fetchWithCSRF = useCallback(async (url, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return fetch(url, options);
    }

    let body = options.body;
    
    // Si el body es un string JSON, parsearlo y agregar _csrf
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        parsed._csrf = csrfToken;
        body = JSON.stringify(parsed);
      } catch (e) {
        // Si no es JSON, adjuntar como query parameter
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}_csrf=${encodeURIComponent(csrfToken)}`;
      }
    }

    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };

    return fetch(url, {
      ...options,
      method,
      headers,
      body,
    });
  }, [csrfToken]);

  return {
    csrfToken,
    saveToken,
    clearToken,
    fetchWithCSRF,
  };
}
