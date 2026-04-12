# 🚀 OnKey Landing Page - Implementation Guide

## 📌 Quick Start

### File Structure
```
frontend/
├── src/
│   ├── pages/
│   │   └── LandingPage.jsx (Componente principal)
│   ├── components/
│   │   └── layout/
│   │       └── Navigation.jsx (Navbar responsive)
│   └── App.jsx
└── package.json
```

### Para Implementar Rápido

1. **Copiar los archivos:**
   - Reemplazar/crear `LandingPage.jsx` en `frontend/src/pages/`
   - Reemplazar `Navigation.jsx` en `frontend/src/components/layout/`

2. **En App.jsx, importar y renderizar:**
   ```jsx
   import LandingPage from './pages/LandingPage';
   
   function App() {
     return <LandingPage />;
   }
   ```

3. **Verificar dependencias en `package.json`:**
   ```json
   "dependencies": {
     "react": "^18.3.1",
     "react-dom": "^18.3.1",
     "lucide-react": "^0.469.0"  // Ya incluido
   }
   ```

4. **Instalar si es necesario:**
   ```bash
   npm install lucide-react
   ```

5. **Ejecutar development:**
   ```bash
   npm run dev
   ```

---

## 🎨 Tailwind Setup (Si No Está Configurado)

### Verificar que esté en `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Verificar que esté en `index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 📱 Responsive Testing Checklist

### Desktop (1920px)
- [ ] Spacing correcto
- [ ] Imágenes/mockups visibles
- [ ] Texto legible
- [ ] CTAs clickables

### Tablet (768px)
- [ ] Grid collapsa a 2 cols
- [ ] Texto mantiene tamaño legible
- [ ] Botones accesibles
- [ ] Navbar funciona bien

### Mobile (375px)
- [ ] Todo en 1 columna
- [ ] Buttons full-width o casi
- [ ] Hamburger menu funciona
- [ ] No hay scroll horizontal
- [ ] Tapeable areas (min 44x44px)

### Test en BrowserStack / Device Labs
```
iOS Safari: iPhone 12, 14, 15
Android Chrome: Pixel 5, 6, 7
```

---

## 🔧 Customización

### 1. Cambiar Colores Principales

En `LandingPage.jsx`, reemplazar azul por tu color:
```jsx
// Cambiar
className="bg-blue-600"
className="text-blue-600"
className="border-blue-600"

// Por
className="bg-[#TU_COLOR]" // Ej: bg-[#2563eb]
```

### 2. Logos y Branding

```jsx
// HERO
<div className="font-bold text-2xl text-blue-600">OnKey</div>

// Cambiar por:
<img src="/logo.png" alt="OnKey" className="h-8" />
```

### 3. Cambiar Texto

Todos los textos están directamente en el componente — es fácil buscar y reemplazar.

**Buscar:**
- "Un sistema para todo tu negocio inmobiliario"
- "Probar gratis 14 días"
- Etc.

**Reemplazar** por tu copy si quieres hacer A/B tests.

### 4. Cambiar Imágenes

En HERO section, reemplazar placeholder:
```jsx
{/* Hero Image - Mockup */}
<div className="bg-gradient-to-b from-blue-100 to-transparent rounded-2xl border border-blue-200 p-8 aspect-video flex items-center justify-center">
  {/* AQUÍ: Reemplazar con <img> real */}
  <img 
    src="/dashboard-mockup.png" 
    alt="Dashboard OnKey"
    className="w-full h-full object-cover rounded-xl"
  />
</div>
```

### 5. Cambiar Testimonios

Buscar la sección `TESTIMONIALES`:
```jsx
{/* Testimonial 1 */}
<div className="p-8 border border-gray-200 rounded-xl">
  {/* Cambiar nombre, rol, testimonial */}
  <p className="text-gray-700 mb-6 leading-relaxed">
    "AQUÍ: Tu testimonio"
  </p>
  <div>
    <p className="font-bold text-gray-900">NOMBRE</p>
    <p className="text-sm text-gray-600">ROL / Contexto</p>
  </div>
</div>
```

### 6. Cambiar Planes/Pricing

Buscar `PRICING SECTION` y modificar:
```jsx
<span className="text-4xl font-bold text-gray-900">$49</span>
<span className="text-gray-600">/mes</span>
```

---

## 📊 Analytics Setup

### Google Analytics 4

1. **Crear GA4 property** en Google Analytics
2. **Agregar tracking code** en `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Eventos Clave a Trackear

```javascript
// Hero CTA Primary
gtag('event', 'click_hero_cta_primary', {
  'button_text': 'Probar gratis 14 días'
});

// Email Form Submit
gtag('event', 'email_signup', {
  'section': 'final-cta'
});

// Link clicks
gtag('event', 'click_link', {
  'link_text': 'Funcionalidades',
  'section': 'navigation'
});
```

### Heatmap (Hotjar)

1. Instalar Hotjar script en `index.html`
2. Track scroll depth, clicks, exit intent
3. Esto te dirá:
   - Dónde los usuarios se quedan atrapados
   - Qué secciones leen vs saltan
   - Dónde dropout ocurre

---

## 💌 Email Automation Setup

### Option 1: Airtable + Zapier (Simple)

1. **Base de datos Airtable** con campos:
   - Email
   - Date submitted
   - Source (navigation, pricing, etc.)

2. **Zapier trigger:**
   - On form submit
   - Create row in Airtable
   - Send email automático

### Option 2: Supabase + Email Service

```jsx
// On form submit:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Save to Supabase
  const { error } = await supabase
    .from('landing_signups')
    .insert([{ email: email, created_at: new Date() }]);
  
  if (!error) {
    // Send welcome email via SendGrid/Resend
    setSubmitted(true);
  }
};
```

### Option 3: Direct Integration (Best)

Si tienes backend, POST a tu API:
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const response = await fetch('/api/landing/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  if (response.ok) {
    // Tu backend envia welcome email
    setSubmitted(true);
  }
};
```

---

## 🚀 Deployment

### Deploy en Vercel (Recomendado para React)

1. **Conectar repositorio GitHub**
   ```bash
   git push origin main
   ```

2. **En Vercel:**
   - Conectar repo
   - Build command: `npm run build`
   - Output directory: `dist`
   - Click Deploy

3. **Dominio custom:**
   - Vercel → Settings → Domains
   - Agregar tu dominio

### Deploy en Railway (Backend + Frontend)

```bash
# En directorio raíz del proyecto
railway link
railway up
```

---

## 🔒 SEO & Meta Tags

En `index.html`, actualizar:
```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="Gestión inmobiliaria simple y moderna. Centraliza propiedades, contratos, contactos y alertas. Prueba gratis 14 días." />
<meta name="keywords" content="gestión inmobiliaria, software SaaS, propiedades, contratos, alertas" />
<meta property="og:title" content="OnKey - Gestión Inmobiliaria Simple" />
<meta property="og:description" content="Un sistema para todo tu negocio inmobiliario" />
<meta property="og:image" content="/og-image.png" />
<meta property="og:url" content="https://onkey.app" />
<title>OnKey - Gestión Inmobiliaria SaaS</title>
```

### Schema Markup (JSON-LD)

En `LandingPage.jsx`, agregar antes del return:
```jsx
useEffect(() => {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "SoftwareApplication",
    "name": "OnKey",
    "applicationCategory": "BusinessApplication",
    "description": "Sistema de gestión inmobiliaria",
    "url": "https://onkey.app",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.innerHTML = JSON.stringify(schema);
  document.head.appendChild(script);
}, []);
```

---

## 📈 Launch Checklist

### Pre-Launch (1 semana antes)
- [ ] Contenido finalizado
- [ ] Todas las imágenes / mockups listos
- [ ] Testimonios verificados
- [ ] Email automation probado
- [ ] Formulario funciona
- [ ] Analytics setup
- [ ] Mobile responsivo en todos devices
- [ ] Performance optimizado (<3s load)

### Launch Day
- [ ] Deploy a producción
- [ ] Probar todos CTAs
- [ ] Verificar email confirmación
- [ ] Monitor analytics
- [ ] Anunciar en redes

### Post-Launch (Primeras 48h)
- [ ] Revisar bounce rate
- [ ] Revisar scroll depth
- [ ] Revisar email submissions
- [ ] Buscar bugs/issues
- [ ] Monitor performance

---

## 📊 Metrics Dashboard

### Crear un dashboard en Google Sheets para monitorear:

| Metric | Daily | Weekly | Target |
|--------|-------|--------|--------|
| Pageviews | - | - | 500+ |
| Bounce Rate | - | - | <50% |
| Avg Session Duration | - | - | >2:00 |
| Scroll to 50% | - | - | >70% |
| Email Signups | - | - | 5-8% of visitors |
| CTA Click Rate | - | - | 4-6% |

### Setup automático con Google Sheets + GA4:
- Crear script que daily extrae metrics from GA4
- Auto-populate en spreadsheet
- Visualizar trends

---

## 🎯 Post-Launch Optimization

### Week 1: Monitor & Stabilize
```
- Track all metrics
- Fix any bugs/issues
- Respond to first users
```

### Week 2: First A/B Test
```
Start simple: Headline test
- Variant A: Current
- Variant B: Alternative (from COPYWRITING doc)
- Measure: CTR on Hero CTA
- Min sample: 500 visitors per variant
```

### Week 3-4: Iterate
```
- Analyze results
- Implement winning variant
- Test next variable (CTA copy, email inputs, etc.)
- Don't change multiple things at once
```

### Month 2+: Continuous Improvement
```
- A/B test testimonials
- Test different pricing displays
- Optimize bottom-of-funnel
- Expand traffic channels
```

---

## 📞 Support & Maintenance

### Common Issues

**Issue:** Email not sending
- Check email service credentials
- Verify SMTP setup
- Check spam folder

**Issue:** Form not submitting
- Check console for errors
- Verify API endpoint
- Check CORS settings (if backend)

**Issue:** Mobile not responsive
- Check viewport meta tag
- Verify Tailwind responsive classes
- Test in actual devices

**Issue:** Slow performance
- Optimize images (WebP)
- Lazy load images
- Minimize CSS/JS
- Use CDN for static assets

---

## 🎓 Resources

### Learning More
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Hooks Guide](https://react.dev/reference/react)
- [Lucide Icons](https://lucide.dev)
- [GA4 Setup](https://support.google.com/analytics/answer/10089681)

### Tools
- [Vercel](https://vercel.com) - Deployment
- [Hotjar](https://www.hotjar.com) - Heatmaps
- [Google Analytics](https://analytics.google.com) - Analytics
- [Zapier](https://zapier.com) - Automation
- [Airtable](https://airtable.com) - CRM

---

## ✅ Final Checklist

- [ ] Landing page responsive
- [ ] Todos los links funcionales
- [ ] Email form funciona
- [ ] Analytics config
- [ ] SEO setup
- [ ] Performance optimizado
- [ ] Deployed en producción
- [ ] Dominio configurado
- [ ] Monitoreando metrics
- [ ] A/B tests listos

---

**Created:** 2024
**Maintainer:** Tu equipo OnKey
**Last Updated:** [HOY]
**Status:** Ready for launch
