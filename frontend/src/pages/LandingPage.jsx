import React, { useState } from 'react';
import { ArrowRight, CheckCircle, AlertCircle, BarChart3, Users, FileText, Bell, Zap, Shield, Clock } from 'lucide-react';

const LandingPage = ({ onLoginClick, onSignupClick }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="w-full bg-white dark:bg-[#0f0f0f] overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-[#0f0f0f]/90 backdrop-blur-md border-b border-gray-100 dark:border-[#1f1f1f] z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/Gemini_Generated_Image_5pu4335pu4335pu4-removebg-preview.png" alt="OnKey" className="h-12 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">OnKey</span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Funcionalidades</a>
            <a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Planes</a>
            <a href="#testimonios" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Testimonios</a>
            <button
              onClick={() => onLoginClick?.()}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => onSignupClick?.()}
              className="px-6 py-2 text-white bg-blue-600 dark:bg-blue-500 border border-blue-600 dark:border-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium"
            >
              Registrarse
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 to-white dark:from-[#0a0e1a] dark:to-[#0f0f0f]">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium border border-transparent dark:border-blue-500/20">
              <Zap size={16} />
              Gestión inmobiliaria 10x más simple
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white text-center leading-tight mb-6">
            Un sistema para todo tu negocio inmobiliario
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-10 leading-relaxed">
            Propiedades, contratos, contactos y alertas en un mismo lugar.
            Ahorra 10 horas semanales en tareas administrativas.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => onSignupClick?.()}
              className="px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-lg hover:shadow-xl"
            >
              Probar gratis 14 días
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => onLoginClick?.()}
              className="px-8 py-4 bg-white dark:bg-[#1a1a1a] text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-[#2d2d2d] rounded-lg font-semibold hover:border-blue-600 dark:hover:border-blue-500 transition"
            >
              ¿Ya tienes cuenta?
            </button>
          </div>

          {/* Hero Image - Mockup */}
          <div className="bg-gradient-to-b from-blue-100 to-transparent dark:from-[#0d1f3c]/60 dark:to-transparent rounded-2xl border border-blue-200 dark:border-[#1a2d4a] p-8 aspect-video flex items-center justify-center">
            <div className="text-center text-gray-400 dark:text-gray-600">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">Dashboard moderno y limpio</p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600 dark:text-green-500" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600 dark:text-green-500" />
              <span>Acceso inmediato</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-green-600 dark:text-green-500" />
              <span>Datos protegidos</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMAS SECTION */}
      <section className="py-20 px-6 bg-white dark:bg-[#0f0f0f]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">El problema real</p>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Por qué gestionar inmuebles es tan complicado?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              La mayoría de los gestores inmobiliarios pierden tiempo valioso en tareas administrativas que no generan valor real.
            </p>
          </div>

          {/* Problem Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Problem 1 */}
            <div className="p-8 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 rounded-xl">
              <div className="w-12 h-12 bg-red-200 dark:bg-red-900/40 rounded-lg flex items-center justify-center mb-4">
                <Clock className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                Pierdes horas en tareas administrativas
              </h3>
              <p className="text-gray-700 dark:text-gray-400">
                Actualizar hojas de cálculo, enviar recordatorios, organizar documentos... tareas sin valor que roban tu tiempo.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="p-8 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 rounded-xl">
              <div className="w-12 h-12 bg-red-200 dark:bg-red-900/40 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                Información dispersa en múltiples lugares
              </h3>
              <p className="text-gray-700 dark:text-gray-400">
                Propiedades en Excel, contratos en carpetas, mensajes en WhatsApp... ningún único lugar de verdad.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="p-8 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 rounded-xl">
              <div className="w-12 h-12 bg-red-200 dark:bg-red-900/40 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                Pierdes de vista detalles críticos
              </h3>
              <p className="text-gray-700 dark:text-gray-400">
                Contratos que vencen, pagos olvidados, documentos caducados. Los errores cuestan dinero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="py-20 px-6 bg-gradient-to-b from-blue-50 to-white dark:from-[#0a0e1a] dark:to-[#0f0f0f]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">La solución</p>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              OnKey: tu sistema operativo inmobiliario
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Un sistema inteligente que automatiza lo tedioso y te deja enfocado en lo que importa: cerrar negocios.
            </p>
          </div>

          {/* Solution explainer */}
          <div className="space-y-8">
            {/* Benefit 1 */}
            <div className="flex gap-8 items-start">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 size={40} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Dashboard centralizado</h3>
                <p className="text-gray-700 dark:text-gray-400 text-lg leading-relaxed">
                  Visualiza todas tus propiedades, contratos, contactos y métricas en un mismo lugar.
                  No es otro sistema más: es tu único sistema.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex gap-8 items-start">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell size={40} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Alertas inteligentes</h3>
                <p className="text-gray-700 dark:text-gray-400 text-lg leading-relaxed">
                  Recibe notificaciones automáticas cuando un contrato está por vencer, un pago se aproxima,
                  o un documento expira. Nunca más sorpresas.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex gap-8 items-start">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap size={40} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Automatización completa</h3>
                <p className="text-gray-700 dark:text-gray-400 text-lg leading-relaxed">
                  Olvídate de actualizar hojas de cálculo, enviar recordatorios manuales y buscar documentos.
                  OnKey lo hace por ti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 px-6 bg-white dark:bg-[#141414]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">Funcionalidades</p>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Todo lo que necesitas para profesionalizar
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Dashboard */}
            <div className="p-8 rounded-xl border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-lg dark:hover:shadow-black/40 transition">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/15 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="text-blue-600 dark:text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Dashboard inteligente</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Métricas en tiempo real: propiedades activas, rentabilidad, ocupación, próximos vencimientos.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                  Visualización personalizable
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                  Reportes exportables
                </li>
              </ul>
            </div>

            {/* Feature 2: Properties */}
            <div className="p-8 rounded-xl border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-lg dark:hover:shadow-black/40 transition">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-500/15 rounded-lg flex items-center justify-center mb-4">
                <FileText className="text-green-600 dark:text-green-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Gestión de propiedades</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Registro centralizado de todas tus propiedades: datos, fotos, documentos y estado.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                  Registro completo de inmuebles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                  Historial de cambios
                </li>
              </ul>
            </div>

            {/* Feature 3: Contacts */}
            <div className="p-8 rounded-xl border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-lg dark:hover:shadow-black/40 transition">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-500/15 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-purple-600 dark:text-purple-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Contratos centralizados</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Base de datos unificada de propietarios, inquilinos y coordinadores.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                  Inquilinos, propietarios y gestores
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                  Historial de interacciones
                </li>
              </ul>
            </div>

            {/* Feature 4: Contracts */}
            <div className="p-8 rounded-xl border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-lg dark:hover:shadow-black/40 transition">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-500/15 rounded-lg flex items-center justify-center mb-4">
                <FileText className="text-orange-600 dark:text-orange-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Gestión de documentos</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Crea, almacena y controla automáticamente todos tus contratos en un lugar.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                  Almacenamiento seguro
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                  Seguimiento de vencimientos
                </li>
              </ul>
            </div>

            {/* Feature 5: Alerts */}
            <div className="p-8 rounded-xl border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-lg dark:hover:shadow-black/40 transition">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-500/15 rounded-lg flex items-center justify-center mb-4">
                <Bell className="text-red-600 dark:text-red-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Alertas automáticas</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Notificaciones inteligentes que no se pierden: vencimientos, pagos, documentos.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                  Notificaciones en tiempo real
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                  Alertas personalizables
                </li>
              </ul>
            </div>

            {/* Feature 6: Security */}
            <div className="p-8 rounded-xl border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-lg dark:hover:shadow-black/40 transition">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/15 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-blue-600 dark:text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Seguridad empresarial</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Tus datos están seguros. Control de acceso por roles y encriptación.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                  Encriptación y backup
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                  Respaldos automáticos
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* KEY BENEFITS SECTION */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-900/80 dark:to-[#0a0e1a]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Resultados reales que obtendrás
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="text-blue-300" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">10+ horas ahorradas por semana</h3>
                  <p className="text-blue-200">
                    Sin tareas administrativas repetitivas, tu equipo se enfoca en cerrar negocios.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="text-blue-300" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Cero vencimientos olvidados</h3>
                  <p className="text-blue-200">
                    Alertas automáticas de todo: contratos, pagos, renovaciones. Nada se escapa.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="text-blue-300" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Control total de tu negocio</h3>
                  <p className="text-blue-200">
                    Un único lugar de verdad. Toda tu información centralizada y accesible.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="text-blue-300" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Menos errores administrativos</h3>
                  <p className="text-blue-200">
                    Automatización significa menos lugar para equivocaciones humanas. Precisión garantizada.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="text-blue-300" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Métricas en tiempo real</h3>
                  <p className="text-blue-200">
                    Ve exactamente cómo está tu negocio: rentabilidad, ocupación, flujo de efectivo.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="text-blue-300" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Escalabilidad sin complejidad</h3>
                  <p className="text-blue-200">
                    Crece sin aumentar la carga administrativa. El sistema crece contigo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonios" className="py-20 px-6 bg-white dark:bg-[#0f0f0f]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">Lo que dicen nuestros usuarios</p>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Administradores de propiedades que transformaron su negocio
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="p-8 border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] rounded-xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "Desde que uso OnKey, no vuelvo a perder un vencimiento. He ahorrado horas en administración y puedo enfocarme realmente en el negocio. Es indispensable."
              </p>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Martín Rodríguez</p>
                <p className="text-sm text-gray-600 dark:text-gray-500">Administrador de 45 propiedades</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] rounded-xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "Para mi negocio de corretaje, OnKey fue un cambio de juego. Tengo todos los detalles de cada propiedad en un lugar, las alertas me ayudan a estar siempre atenta. Muy recomendado."
              </p>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Clara Martínez</p>
                <p className="text-sm text-gray-600 dark:text-gray-500">Corredora inmobiliaria independiente</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] rounded-xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "Nuestra inmobiliaria creció 40% el año pasado. OnKey nos permitió manejar más propiedades con el mismo equipo. No es hype, realmente funciona."
              </p>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Juan Carlos López</p>
                <p className="text-sm text-gray-600 dark:text-gray-500">Director de Inmobiliaria</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-[#111111] dark:to-[#0f0f0f]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">Planes simples</p>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Elige el plan que se adapte a tu negocio
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Sin compromisos a largo plazo. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Plan 1: Starter */}
            <div className="rounded-xl border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Para freelancers e independientes</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-600 dark:text-gray-400">/mes</span>
              </div>
              <button className="w-full px-6 py-3 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition mb-8">
                Empezar gratis
              </button>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Hasta 10 propiedades</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Gestión de contactos básica</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Dashboard simple</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Alertas básicas</span>
                </li>
              </ul>
            </div>

            {/* Plan 2: Pro (Destacado) */}
            <div className="rounded-xl border-2 border-blue-600 dark:border-blue-500 p-8 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/40 dark:to-[#1a1a1a] shadow-2xl dark:shadow-blue-900/20 transform md:scale-105">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pro</h3>
                <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">Popular</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Para inmobiliarias y administradores activos</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$49</span>
                <span className="text-gray-600 dark:text-gray-400">/mes</span>
              </div>
              <button className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition mb-8">
                Probar gratis 14 días
              </button>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Propiedades ilimitadas</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Gestión completa de contactos</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Dashboard avanzado</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Gestión de contratos</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Alertas inteligentes</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Reportes personalizados</span>
                </li>
              </ul>
            </div>

            {/* Plan 3: Enterprise */}
            <div className="rounded-xl border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Para grandes portfolios</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$199+</span>
                <span className="text-gray-600 dark:text-gray-400">/mes</span>
              </div>
              <button className="w-full px-6 py-3 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition mb-8">
                Contactar ventas
              </button>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Todo en Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Usuarios ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Integraciones personalizadas</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Soporte prioritario</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Capacitación del equipo</span>
                </li>
              </ul>
            </div>
          </div>

          {/* All plans include */}
          <div className="bg-blue-50 dark:bg-blue-950/25 border border-blue-200 dark:border-blue-900/50 rounded-xl p-8 text-center">
            <p className="text-gray-900 dark:text-white font-semibold mb-4">✓ Todos nuestros planes incluyen:</p>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Datos seguros</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Encriptación y respaldos</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Soporte 24/7</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Equipo siempre disponible</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Actualizaciones gratis</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mejoras permanentes</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Cancelación flexible</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sin compromisos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 px-6 bg-white dark:bg-[#141414]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">FAQ</p>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Respuestas a tus dudas</h2>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                <span>¿Tengo que pagar tarjeta para la prueba gratuita?</span>
                <span className="text-gray-500 dark:text-gray-500 group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                No. Los 14 días de prueba gratis no requieren tarjeta de crédito. Te das de alta, pruebas todo el sistema, y decides si quieres continuar.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                <span>¿Cuánto tiempo toma configurar OnKey?</span>
                <span className="text-gray-500 dark:text-gray-500 group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                Puedes tener tu primer propiedad registrada en menos de 5 minutos. La migración de datos existentes es simple: importa desde Excel o cuéntale a nuestro equipo.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                <span>¿Puedo traer mis datos actuales?</span>
                <span className="text-gray-500 dark:text-gray-500 group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                Sí. Aceptamos archivos Excel, CSV, o PDFs. Nuestro equipo puede ayudarte a migrar tus datos sin perder nada en el proceso.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                <span>¿Está mi información segura?</span>
                <span className="text-gray-500 dark:text-gray-500 group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                Sí. Usamos encriptación de nivel empresa, respaldos automáticos diarios, y cumplimos con estándares de privacidad. Tus datos son responsabilidad seria para nosotros.
              </p>
            </details>

            {/* FAQ 5 */}
            <details className="border border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] rounded-lg p-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                <span>¿Puedo invitar a mi equipo?</span>
                <span className="text-gray-500 dark:text-gray-500 group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                Claro. Invita a tu equipo con control de permisos: algunos ven todo, otros solo sus propiedades asignadas. Tú controlas quién ve qué.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-24 px-6 bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-900/80 dark:to-[#0a0e1a]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-xl text-blue-200 mb-10 leading-relaxed">
            Únete a cientos de gestores inmobiliarios que ya ahorran tiempo y dinero con OnKey.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="flex-1 px-6 py-4 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none border border-transparent dark:border-[#333]"
            />
            <button
              type="submit"
              onClick={(e) => {
                handleSubmit(e);
                if (email) {
                  setTimeout(() => onSignupClick?.(), 500);
                }
              }}
              className="px-8 py-4 bg-white dark:bg-blue-500 text-blue-600 dark:text-white font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
              Comenzar gratis
              <ArrowRight size={20} />
            </button>
          </form>

          {submitted && (
            <p className="text-white text-center">
              ✓ ¡Te enviaremos el acceso en tu email ahora!
            </p>
          )}

          <p className="text-blue-200 text-sm">
            Únete a 100+ profesionales inmobiliarios que ya usan OnKey
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 dark:bg-[#080808] text-gray-400 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="font-bold text-2xl text-white mb-4">OnKey</div>
              <p className="text-sm leading-relaxed">
                Gestión inmobiliaria simple, moderna y poderosa.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Planes</a></li>
                <li><a href="#" className="hover:text-white transition">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Acerca de</a></li>
                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition">Términos</a></li>
                <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold text-white mb-4">Síguenos</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 dark:border-[#1f1f1f] pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm">© 2024 OnKey. Todos los derechos reservados.</p>
            <p className="text-sm text-gray-500">Hecho con ❤️ para inmobiliarias</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
