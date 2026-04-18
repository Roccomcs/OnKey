import { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { API } from '../utils/helpers';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import '../App.css';

export default function Login({ auth, verifiedStatus, onLoginSuccess, onBackClick, initialView = 'login' }) {
  const [view, setView]           = useState(initialView); // 'login' | 'register' | 'registered'
  const [dark, setDark]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone]       = useState(false);
  const needsVerification = error.includes('verificar');

  const [regForm, setRegForm] = useState({
    nombre: '', apellido: '', email: '',
    password: '', tenantNombre: '', dni: '',
  });

  // Google OAuth hook
  const {
    handleGoogleLoginSuccess,
    handleGoogleRegisterSuccess,
    handleGoogleError,
    error: googleError,
    loading: googleLoading,
    clearError: clearGoogleError,
  } = useGoogleAuth({
    onLoginSuccess: () => {
      onLoginSuccess?.();
    },
    onRegisterReady: (googleData) => {
      // Auto-llenar formulario de registro
      setRegForm(prev => ({
        ...prev,
        nombre: googleData.nombre || '',
        apellido: googleData.apellido || '',
        email: googleData.email || '',
        tenantNombre: `${googleData.nombre || ''} ${googleData.apellido || ''}`.trim(),
      }));
      switchView('register');
    },
  });

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') ||
                   localStorage.getItem('theme') === 'dark';
    setDark(isDark);
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Limpiar error al cambiar de vista
  const switchView = (v) => { 
    setView(v); 
    setError(''); 
    clearGoogleError();
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginForm.email.trim())        return setError('Ingresá tu email');
    if (!loginForm.email.includes('@')) return setError('Email inválido');
    if (!loginForm.password)            return setError('Ingresá tu contraseña');

    setLoading(true);
    try {
      await auth.login(null, loginForm.email, loginForm.password);
      onLoginSuccess?.();
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend verification ────────────────────────────────────────────────────
  const handleResendVerification = async () => {
    if (!loginForm.email) return setError('Ingresá tu email primero');
    setResendLoading(true);
    try {
      const res = await fetch(`${API}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al reenviar');
      setResendDone(true);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!regForm.nombre.trim())        return setError('Ingresá tu nombre');
    if (!regForm.apellido.trim())      return setError('Ingresá tu apellido');
    if (!regForm.email.trim())         return setError('Ingresá tu email');
    if (!regForm.email.includes('@'))  return setError('Email inválido');
    if (!regForm.password)             return setError('Creá una contraseña');
    if (regForm.password.length < 6)   return setError('La contraseña debe tener mínimo 6 caracteres');

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:       regForm.nombre.trim(),
          apellido:     regForm.apellido.trim(),
          email:        regForm.email.trim(),
          password:     regForm.password,
          tenantNombre: regForm.tenantNombre.trim() || `${regForm.nombre.trim()} ${regForm.apellido.trim()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar');
      setView('registered');
    } catch (err) {
      setError(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ───────────────────────────────────────────────────────────
  // Se maneja ahora en el hook useGoogleAuth
  // Aquí solo se usan los handlers del hook

  // ── Clases reutilizables ───────────────────────────────────────────────────
  const inputCls = `w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
    dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'border border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const labelCls = `block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`;
  const linkCls  = `text-blue-500 hover:text-blue-400 font-medium cursor-pointer underline-offset-2 hover:underline`;

  return (
    <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center p-4 ${
      dark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className={`w-full max-w-md rounded-lg shadow-lg p-8 transition-colors duration-300 ${
        dark ? 'bg-gray-800 shadow-2xl shadow-blue-900/20' : 'bg-white shadow-lg'
      }`}>
        {/* Botón Volver */}
        <button
          onClick={() => onBackClick?.()}
          className={`flex items-center gap-2 text-sm mb-4 px-3 py-1 rounded-lg transition ${
            dark 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft size={16} />
          <span>Volver a Inicio</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-800'}`}>OnKey</h1>
          <p className={dark ? 'text-gray-400' : 'text-gray-600'}>Gestión Inmobiliaria</p>
        </div>

        {/* Banner: email verificado OK */}
        {verifiedStatus === '1' && view === 'login' && (
          <div className={`flex items-center gap-2 rounded-lg px-4 py-3 mb-4 text-sm ${
            dark ? 'bg-green-900/30 border border-green-700 text-green-300' : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            <CheckCircle size={16} className="shrink-0" />
            <span>Email verificado correctamente. Ya podés iniciar sesión.</span>
          </div>
        )}

        {/* Banner: error de verificación */}
        {verifiedStatus === 'error' && view === 'login' && (
          <div className={`flex items-center gap-2 rounded-lg px-4 py-3 mb-4 text-sm ${
            dark ? 'bg-red-900/30 border border-red-700 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <AlertCircle size={16} className="shrink-0" />
            <span>El enlace de verificación no es válido o expiró. Registrate nuevamente.</span>
          </div>
        )}

        {/* ── Vista: Registro exitoso ── */}
        {view === 'registered' && (
          <div className="text-center space-y-4">
            <CheckCircle size={48} className="mx-auto text-green-500" />
            <h2 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>
              ¡Registro exitoso!
            </h2>
            <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
              Te enviamos un mail de confirmación a <strong>{regForm.email}</strong>.
              Hacé clic en el enlace del mail para activar tu cuenta.
            </p>
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              Si no lo ves, revisá tu carpeta de spam.
            </p>
            <button
              onClick={() => switchView('login')}
              className="mt-2 text-sm text-blue-500 hover:text-blue-400 underline underline-offset-2"
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}

        {/* ── Vista: Login ── */}
        {view === 'login' && (
          <>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {resendDone && (
                <div className={`border rounded-lg text-sm px-4 py-3 ${
                  dark ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-700'
                }`}>Mail de verificación reenviado. Revisá tu bandeja de entrada.</div>
              )}
              {(error || googleError) && (
                <div className={`border rounded-lg text-sm px-4 py-3 ${
                  dark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {error || googleError}
                  {needsVerification && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="block mt-2 underline font-medium hover:opacity-80 disabled:opacity-50"
                    >
                      {resendLoading ? 'Enviando...' : 'Reenviar email de verificación'}
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email" name="email" value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="usuario@ejemplo.com"
                  className={inputCls} disabled={loading}
                />
              </div>

              <div>
                <label className={labelCls}>Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="••••••••"
                    className={`${inputCls} pr-12`} disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                      dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                    } ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className={`w-full py-2 rounded-lg font-medium text-white transition ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {loading ? 'Autenticando...' : 'Ingresar'}
              </button>

              <div className="flex justify-center">
                <GoogleLogin
                  key="google-login"
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleError}
                  text="signin_with"
                  type="standard"
                  disabled={loading || googleLoading}
                />
              </div>
            </form>

            <div className={`mt-6 pt-6 border-t text-center text-sm ${
              dark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'
            }`}>
              <p>
                ¿No tenés cuenta?{' '}
                <span className={linkCls} onClick={() => switchView('register')}>
                  Registrarse
                </span>
              </p>
            </div>


          </>
        )}

        {/* ── Vista: Registro ── */}
        {view === 'register' && (
          <>
            <h2 className={`text-xl font-semibold mb-5 ${dark ? 'text-white' : 'text-gray-800'}`}>
              Crear cuenta
            </h2>

            <form onSubmit={handleRegSubmit} className="space-y-4">
              {(error || googleError) && (
                <div className={`border rounded-lg text-sm px-4 py-3 ${
                  dark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
                }`}>{error || googleError}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input
                    type="text" name="nombre" value={regForm.nombre}
                    onChange={handleRegChange} placeholder="Juan"
                    className={inputCls} disabled={loading}
                  />
                </div>
                <div>
                  <label className={labelCls}>Apellido</label>
                  <input
                    type="text" name="apellido" value={regForm.apellido}
                    onChange={handleRegChange} placeholder="Pérez"
                    className={inputCls} disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email" name="email" value={regForm.email}
                  onChange={handleRegChange} placeholder="juan@ejemplo.com"
                  className={inputCls} disabled={loading}
                />
              </div>

              <div>
                <label className={labelCls}>Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={regForm.password}
                    onChange={handleRegChange} placeholder="Mínimo 6 caracteres"
                    className={`${inputCls} pr-12`} disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                      dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                    } ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className={`w-full py-2 rounded-lg font-medium text-white transition ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </button>

              <div className={`relative text-center text-xs font-medium mt-4 mb-4 ${
                dark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
                <span className={`relative px-2 ${dark ? 'bg-gray-800' : 'bg-white'}`}>O</span>
              </div>

              <div className="text-center">
                <p className={`text-sm mb-3 font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Registrarse rápidamente con Google
                </p>
                <div className="flex justify-center">
                  <GoogleLogin
                    key="google-register"
                    onSuccess={handleGoogleRegisterSuccess}
                    onError={handleGoogleError}
                    text="signup_with"
                    type="standard"
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>
            </form>

            <div className={`mt-6 pt-6 border-t text-center text-sm ${
              dark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'
            }`}>
              <p>
                ¿Ya tenés cuenta?{' '}
                <span className={linkCls} onClick={() => switchView('login')}>
                  Iniciar sesión
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
