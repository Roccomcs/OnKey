import {  useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../App.css';

export default function Login({ auth }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim())        return setError('Ingrese su email');
    if (!form.email.includes('@')) return setError('Email inválido');
    if (!form.password)            return setError('Ingrese su contraseña');
    if (form.password.length < 6)  return setError('La contraseña debe tener mínimo 6 caracteres');

    setLoading(true);
    try {
      await auth.login(null, form.email, form.password);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center p-4 ${
      dark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className={`w-full max-w-md rounded-lg shadow-lg p-8 transition-colors duration-300 ${
        dark ? 'bg-gray-800 shadow-2xl shadow-blue-900/20' : 'bg-white shadow-lg'
      }`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-800'}`}>
            OnKey
          </h1>
          <p className={dark ? 'text-gray-400' : 'text-gray-600'}>Gestión Inmobiliaria</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`border rounded-lg text-sm px-4 py-3 ${
              dark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="usuario@ejemplo.com"
              className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'border border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              disabled={loading}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2 pr-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'border border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                  dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                } ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
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
      </div>
    </div>
  );
}