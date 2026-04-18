import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { API } from '../utils/helpers';

export function useGoogleAuth({ onLoginSuccess, onRegisterReady }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setError('');
      setLoading(true);

      if (!credentialResponse?.credential) {
        throw new Error('No se recibió credencial de Google');
      }

      const res = await fetch(`${API}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Si el usuario no existe, permitir registro
        if (res.status === 401 && data.code === 'USER_NOT_FOUND') {
          setError('');
          // Decodificar token para autocompletar formulario
          const decoded = jwtDecode(credentialResponse.credential);
          onRegisterReady?.(decoded);
          return;
        }
        throw new Error(data.error || 'Error al iniciar sesión con Google');
      }

      // Login exitoso
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      localStorage.setItem('tenant', JSON.stringify(data.tenant));

      onLoginSuccess?.();
    } catch (err) {
      console.error('[useGoogleAuth] Error:', err);
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegisterSuccess = async (credentialResponse) => {
    try {
      setError('');
      setLoading(true);

      if (!credentialResponse?.credential) {
        throw new Error('No se recibió credencial de Google');
      }

      const decoded = jwtDecode(credentialResponse.credential);
      const { email, given_name, family_name } = decoded;

      // Retornar datos para autocompletar formulario
      onRegisterReady?.({
        email,
        nombre: given_name || '',
        apellido: family_name || '',
        credential: credentialResponse.credential,
      });

      setError('');
    } catch (err) {
      console.error('[useGoogleAuth] Register decode error:', err);
      setError(err.message || 'Error al procesar datos de Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('[useGoogleAuth] Google error:', error);
    setError('Error al conectar con Google. Por favor, intenta de nuevo.');
  };

  const clearError = () => setError('');

  return {
    handleGoogleLoginSuccess,
    handleGoogleRegisterSuccess,
    handleGoogleError,
    error,
    loading,
    clearError,
  };
}
