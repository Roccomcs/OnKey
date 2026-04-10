import { useState } from 'react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function Register({ onGoToLogin }) {
  const [form, setForm] = useState({
    tenantNombre: '', nombre: '', apellido: '', dni: '',
    email: '', password: '', confirmPassword: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.tenantNombre.trim()) return setError('Ingresá el nombre de tu inmobiliaria');
    if (!form.nombre.trim())       return setError('Ingresá tu nombre');
    if (!form.apellido.trim())     return setError('Ingresá tu apellido');
    if (!form.dni.trim())          return setError('Ingresá tu DNI');
    if (!form.email.includes('@')) return setError('Email inválido');
    if (form.password.length < 6)  return setError('La contraseña debe tener al menos 6 caracteres');
    if (form.password !== form.confirmPassword) return setError('Las contraseñas no coinciden');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantNombre: form.tenantNombre.trim(),
          nombre:       form.nombre.trim(),
          apellido:     form.apellido.trim(),
          dni:          form.dni.trim(),
          email:        form.email.trim().toLowerCase(),
          password:     form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la cuenta');
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 text-center">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Revisá tu correo!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Te enviamos un link de verificación a <strong>{form.email}</strong>.
            Hacé clic en el link para activar tu cuenta y empezar a usar OnKey.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            ¿No llegó? Revisá la carpeta de spam o esperá unos minutos.
          </p>
          <button
            onClick={onGoToLogin}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  // ── Formulario ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Comenzá gratis, sin tarjeta de crédito</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Inmobiliaria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tu Inmobiliaria</label>
            <input name="tenantNombre" value={form.tenantNombre} onChange={handleChange}
              placeholder="ej: Inmobiliaria García" disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>

          {/* Nombre + Apellido en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input name="nombre" value={form.nombre} onChange={handleChange}
                placeholder="Juan" disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input name="apellido" value={form.apellido} onChange={handleChange}
                placeholder="García" disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
          </div>

          {/* DNI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
            <input name="dni" value={form.dni} onChange={handleChange}
              placeholder="12345678" disabled={loading} inputMode="numeric"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="vos@ejemplo.com" disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input name="password" type={showPwd ? 'text' : 'password'} value={form.password}
                onChange={handleChange} placeholder="Mínimo 6 caracteres" disabled={loading}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword}
              onChange={handleChange} placeholder="Repetí la contraseña" disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>

          <button type="submit" disabled={loading}
            className={`w-full py-2.5 rounded-lg font-medium text-white transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
          </button>
        </form>

        <div className="mt-4 bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-700 font-medium">
            ✓ Plan Starter incluye hasta 10 propiedades y 10 contratos
          </p>
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tenés cuenta?{' '}
            <button onClick={onGoToLogin} className="text-blue-600 font-medium hover:underline">
              Iniciá sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}