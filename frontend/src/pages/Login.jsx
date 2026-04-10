import { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { API } from '../utils/helpers';
import '../App.css';

export default function Login({ auth, verifiedStatus }) {
  const [view, setView]           = useState('login'); // 'login' | 'register' | 'registered'
  const [dark, setDark]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const [regForm, setRegForm] = useState({
    nombre: '', apellido: '', email: '',
    tenantNombre: '', password: '',
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
  const switchView = (v) => { setView(v); setError(''); };

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
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
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
    if (!regForm.tenantNombre.trim())  return setError('Ingresá el nombre de tu inmobiliaria');
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
          tenantNombre: regForm.tenantNombre.trim(),
          nombre:       regForm.nombre.trim(),
          apellido:     regForm.apellido.trim(),
          email:        regForm.email.trim(),
          password:     regForm.password,
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
              {error && (
                <div className={`border rounded-lg text-sm px-4 py-3 ${
                  dark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
                }`}>{error}</div>
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

            <div className={`mt-4 pt-4 border-t text-center text-sm ${
              dark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'
            }`}>
              <p className="font-medium mb-3">Para testing:</p>
              <div className={`text-xs space-y-1.5 p-3 rounded font-mono ${
                dark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50'
              }`}>
                <p><strong>Admin:</strong> admin@localhost / admin123</p>
                <p><strong>Starter:</strong> starter@localhost / starter123</p>
                <p><strong>Pro:</strong> pro@localhost / pro123</p>
                <p><strong>Viewer:</strong> viewer@localhost / viewer123</p>
              </div>
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
              {error && (
                <div className={`border rounded-lg text-sm px-4 py-3 ${
                  dark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
                }`}>{error}</div>
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
                <label className={labelCls}>Nombre de la inmobiliaria</label>
                <input
                  type="text" name="tenantNombre" value={regForm.tenantNombre}
                  onChange={handleRegChange} placeholder="Inmobiliaria Ejemplo"
                  className={inputCls} disabled={loading}
                />
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
