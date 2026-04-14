import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Check,
  AlertCircle,
  BarChart3,
  Users,
  FileText,
  Bell,
  Zap,
  Shield,
  Clock,
  Building2,
  TrendingUp,
  Mail,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  Rocket,
  LineChart,
  Sun,
  Moon,
} from 'lucide-react';

const LandingPageModern = ({ onLoginClick, onSignupClick, dark, toggleDark }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
    viewport: { once: true },
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    transition: { staggerChildren: 0.15 },
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 dark:bg-gray-900 overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-[#404040]/50 dark:border-[#404040]/50 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <motion.div className="font-semibold text-xl text-gray-900 dark:text-gray-100 dark:text-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span>OnKey</span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center">
            {['Funcionalidades', 'Soluciones', 'Precios'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-200 transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex gap-3 items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDark}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800 transition-colors duration-200"
              title={dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
            <button
              onClick={() => onLoginClick?.()}
              className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            >
              Iniciar sesión
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSignupClick?.()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              Registrarse
            </motion.button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 dark:bg-gray-800 border-t border-gray-200/50 dark:border-[#404040]/50 dark:border-[#404040]/50 px-4 py-4"
          >
            <div className="flex flex-col gap-3">
              <a href="#funcionalidades" className="text-sm text-gray-900 dark:text-gray-100 px-3 py-2">
                Funcionalidades
              </a>
              <a href="#soluciones" className="text-sm text-gray-900 dark:text-gray-100 px-3 py-2">
                Soluciones
              </a>
              <a href="#precios" className="text-sm text-gray-900 dark:text-gray-100 px-3 py-2">
                Precios
              </a>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onLoginClick?.()}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-[#404040]/50 rounded-lg"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => onSignupClick?.()}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                >
                  Registrarse
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pt-32 pb-20 px-4 md:px-6 bg-gradient-to-b from-slate-50 via-white to-blue-50/30 dark:from-[#0a0e1a] dark:via-[#0f0f0f] dark:to-[#0f0f0f] relative overflow-hidden"
      >
        <div className="absolute top-20 right-0 w-72 h-72 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-xs font-medium text-blue-700 border border-blue-200">
              <Sparkles size={14} />
              La gestión inmobiliaria moderna
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 leading-tight tracking-tight mb-6">
              Tu negocio inmobiliario
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                en un único lugar
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base md:text-lg text-gray-600 dark:text-gray-400 dark:text-gray-400 text-center mb-10 leading-relaxed max-w-2xl mx-auto"
          >
            Propiedades, contratos, contactos y alertas inteligentes. Automatiza tu gestión inmobiliaria y ahorra 15 horas semanales.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSignupClick?.()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Probar gratis 14 días
              <ArrowRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onLoginClick?.()}
              className="px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-[#404040]/50 rounded-lg font-semibold hover:bg-gray-50 dark:bg-gray-800 transition-all duration-200"
            >
              Ver demo
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-6 md:gap-8 text-sm text-gray-600 dark:text-gray-400 mb-16"
          >
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span>Acceso inmediato</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-green-600" />
              <span>Datos 100% protegidos</span>
            </div>
          </motion.div>

          {/* Mini-dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border border-gray-200/70 dark:border-[#2d2d2d] overflow-hidden shadow-2xl dark:shadow-black/60"
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#1a1a1a] border-b border-gray-200/70 dark:border-[#2d2d2d]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 h-5 mx-3 bg-white dark:bg-[#262626] rounded-md border border-gray-200/50 dark:border-[#333] flex items-center justify-center">
                <span className="text-[10px] text-gray-400">onkey.app/dashboard</span>
              </div>
            </div>

            {/* App UI */}
            <div className="flex bg-white dark:bg-[#141414]" style={{ height: '360px' }}>
              {/* Sidebar */}
              <div className="w-[130px] flex-shrink-0 bg-gray-50 dark:bg-[#0f0f0f] border-r border-gray-200/50 dark:border-[#2d2d2d] p-3 flex flex-col gap-1">
                <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-2">OnKey</div>
                {[
                  { label: 'Dashboard', active: true },
                  { label: 'Propiedades' },
                  { label: 'Contratos' },
                  { label: 'Contactos' },
                  { label: 'Alertas' },
                ].map(item => (
                  <div
                    key={item.label}
                    className={`text-[10px] px-2.5 py-1.5 rounded-md font-medium ${
                      item.active
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-4 overflow-hidden">
                {/* Header */}
                <div className="mb-3">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Dashboard</div>
                  <div className="text-[10px] text-gray-400">lunes, 14 de abril de 2026</div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'PROPIEDADES', value: '12', color: 'from-blue-600 to-blue-700' },
                    { label: 'OCUPADAS', value: '9', color: 'from-emerald-500 to-emerald-600' },
                    { label: 'VACANTES', value: '3', color: 'from-orange-500 to-orange-600' },
                    { label: 'RENTA MES.', value: '$142K', color: 'from-slate-600 to-slate-700' },
                  ].map(card => (
                    <div key={card.label} className="bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-100 dark:border-[#333] p-2.5">
                      <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${card.color} mb-2`} />
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{card.value}</div>
                      <div className="text-[8px] text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium mt-0.5">{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* Occupation bar */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-100 dark:border-[#333] p-2.5 mb-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Tasa de Ocupación</span>
                    <span className="text-[11px] font-bold text-emerald-500">75%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-[#2d2d2d] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-emerald-500 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-emerald-500 font-medium">9 ocupadas</span>
                    <span className="text-[9px] text-orange-400 font-medium">3 vacantes</span>
                  </div>
                </div>

                {/* Alerts */}
                <div>
                  <div className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Alertas de Vencimiento</div>
                  <div className="space-y-1.5">
                    {[
                      { name: 'García, Roberto', days: '8 días', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800/50', color: 'text-red-600 dark:text-red-400' },
                      { name: 'López, María', days: '23 días', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/50', color: 'text-amber-600 dark:text-amber-400' },
                    ].map(alert => (
                      <div key={alert.name} className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border ${alert.bg} ${alert.border}`}>
                        <span className={`text-[10px] font-medium ${alert.color}`}>{alert.name}</span>
                        <span className={`text-[10px] font-bold ${alert.color}`}>{alert.days}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* PROBLEMS SECTION */}
      <motion.section
        {...fadeInUp}
        className="py-20 md:py-28 px-4 md:px-6 bg-white dark:bg-gray-900 relative"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 px-3 py-1 bg-blue-50 dark:bg-blue-500/15 rounded-full border border-transparent dark:border-blue-500/20">
              PROBLEMAS REALES
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
              ¿Por qué gestionar inmuebles es tan complicado?
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              La mayoría de los gestores inmobiliarios pierden tiempo valioso en tareas administrativas que no generan valor real.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Clock,
                title: 'Pierdes horas en tareas manuales',
                description: 'Actualizar datos, enviar recordatorios, buscar documentos... tiempo que no genera valor.',
              },
              {
                icon: AlertCircle,
                title: 'Información dispersa en múltiples lugares',
                description: 'Hojas de cálculo, WhatsApp, emails, carpetas... caos sin control.',
              },
              {
                icon: TrendingUp,
                title: 'Pierdes de vista detalles críticos',
                description: 'Contratos que vencen, pagos olvidados, documentos caducados. Los errores cuestan dinero.',
              },
            ].map((problem, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="p-6 md:p-8 rounded-xl border border-gray-200/50 dark:border-[#404040]/50 bg-white dark:bg-gray-900 hover:shadow-sm transition-all duration-200"
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <problem.icon className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{problem.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{problem.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* SOLUTIONS SECTION */}
      <motion.section
        id="soluciones"
        {...fadeInUp}
        className="py-20 md:py-28 px-4 md:px-6 bg-slate-50/50 dark:bg-[#141414] relative"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 px-3 py-1 bg-blue-50 dark:bg-blue-500/15 rounded-full border border-transparent dark:border-blue-500/20">
              SOLUCIONES
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
              OnKey: tu sistema operativo inmobiliario
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar propiedades de forma profesional, en una plataforma elegante.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="space-y-8 md:space-y-12"
          >
            {[
              {
                icon: BarChart3,
                title: 'Dashboard centralizado',
                description:
                  'Visualiza todas tus propiedades, contratos activos, contactos y métricas en tiempo real. Un único lugar de verdad.',
              },
              {
                icon: Bell,
                title: 'Alertas inteligentes',
                description:
                  'Recibe notificaciones automáticas para vencimientos de contratos, pagos pendientes y documentos que expiran.',
              },
              {
                icon: Zap,
                title: 'Automatización completa',
                description:
                  'Olvídate de tareas manuales. Genera reportes, envía recordatorios y actualiza estados automáticamente.',
              },
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="flex gap-6 md:gap-8 items-start"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                >
                  <benefit.icon size={32} className="text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{benefit.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* FEATURES SECTION */}
      <motion.section
        id="funcionalidades"
        {...fadeInUp}
        className="py-20 md:py-28 px-4 md:px-6 bg-white dark:bg-gray-900 dark:bg-gray-900"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 px-3 py-1 bg-blue-50 dark:bg-blue-500/15 rounded-full border border-transparent dark:border-blue-500/20">
              FUNCIONALIDADES
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Todo lo que necesitas para profesionalizar
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: BarChart3, title: 'Dashboard inteligente', description: 'Métricas en tiempo real' },
              { icon: Building2, title: 'Gestión de propiedades', description: 'Registro completo de inmuebles' },
              { icon: Users, title: 'Contactos centralizados', description: 'Inquilinos, propietarios y gestores' },
              { icon: FileText, title: 'Gestión de documentos', description: 'Almacenamiento seguro' },
              { icon: Bell, title: 'Alertas automáticas', description: 'Notificaciones de eventos' },
              { icon: Shield, title: 'Seguridad empresarial', description: 'Encriptación y backups' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-6 md:p-8 rounded-xl border border-gray-200/50 dark:border-[#404040]/50 bg-white dark:bg-gray-900 hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA SECTION */}
      <motion.section
        {...fadeInUp}
        className="py-20 md:py-28 px-4 md:px-6 bg-gradient-to-br from-blue-600 to-purple-700 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white dark:bg-gray-900 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white dark:bg-gray-900 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight"
          >
            ¿Listo para transformar tu negocio?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-blue-100 mb-10"
          >
            Únete a cientos de gestores inmobiliarios que ya ahorran tiempo y dinero
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSignupClick?.()}
            className="px-6 py-3 bg-white dark:bg-gray-900 text-blue-600 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto hover:bg-blue-50 transition-all duration-200 shadow-sm"
          >
            Comienza tu prueba gratuita
            <Rocket size={18} />
          </motion.button>
        </div>
      </motion.section>

      {/* FAQ SECTION */}
      <motion.section
        id="faq"
        {...fadeInUp}
        className="py-20 md:py-28 px-4 md:px-6 bg-white dark:bg-gray-900 dark:bg-gray-900"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 px-3 py-1 bg-blue-50 dark:bg-blue-500/15 rounded-full border border-transparent dark:border-blue-500/20">
              PREGUNTAS FRECUENTES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">Respuestas a tus dudas</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="space-y-3"
          >
            {[
              {
                q: '¿Cuánto cuesta OnKey?',
                a: 'Planes desde $29/mes para gestores individuales hasta soluciones empresariales personalizadas.',
              },
              {
                q: '¿Necesito entrenamiento?',
                a: 'No, OnKey es intuitivo. Ofrecemos tutoriales y soporte para que comiences en minutos.',
              },
              {
                q: '¿Mis datos están seguros?',
                a: 'Sí, encriptación de nivel bancario y cumplimiento con GDPR.',
              },
              {
                q: '¿Puedo importar mis datos?',
                a: 'Perfecto, ofrecemos migración gratuita desde Excel y sistemas antiguos.',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="p-6 rounded-lg border border-gray-200/50 dark:border-[#404040]/50 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:bg-gray-800 transition-all duration-200"
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <ArrowUpRight size={16} className="text-blue-600" />
                  {item.q}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">{item.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gray-900 text-gray-100 py-12 md:py-16 px-4 md:px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-white flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 size={14} className="text-white" />
                </div>
                OnKey
              </h3>
              <p className="text-sm text-gray-400">
                La plataforma definitiva para gestión inmobiliaria profesional.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-white">Producto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#precios" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-white">Contacto</h4>
              <a href="mailto:support@onkey.app" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <Mail size={14} />
                support@onkey.app
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 OnKey. Todos los derechos reservados.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPageModern;
