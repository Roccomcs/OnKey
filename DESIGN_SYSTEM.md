# OnKey — Sistema de Diseño & Rediseño Completo

## 🔍 PARTE 1: AUDITORÍA CRÍTICA

### ¿Por qué se ve "genérico/hecho por IA"?

#### 1. **Tipografía débil**
- ❌ Probablemente Inter o Poppins sin personalidad
- ❌ Jerarquía poco clara (tamaños estándar)
- ❌ Falta peso visual en títulos
- ✅ **Solución**: Geist para headings (tipo Vercel/Stripe), Inter regular para body

#### 2. **Paleta de colores genérica**
- ❌ Azul típico #2563eb (Tailwind estándar)
- ❌ Grises planos sin contraste
- ❌ Falta uso de neutros reales
- ✅ **Solución**: Paleta inspirada en Stripe (grises complejos, azul más sofisticado)

#### 3. **Espaciado inconsistente**
- ❌ Gaps random entre componentes
- ❌ Padding genérico
- ❌ Cards sin jerarquía de espacios
- ✅ **Solución**: Sistema de 4-8px (type scale real)

#### 4. **Componentes genéricos**
- ❌ Cards todos iguales (borde, sombra, padding)
- ❌ Botones sin personalidad
- ❌ Inputs estándar de Tailwind
- ✅ **Solución**: Diseñar con intención (botones contexttuales, cards con variantes)

#### 5. **Copy artificial**
- ❌ "Gestiona todo en un lugar"
- ❌ "Ahorra tiempo y dinero"
- ❌ Frases marketing genéricas
- ✅ **Solución**: Directo, específico, humano

#### 6. **Falta de datos reales**
- ❌ Dashboard mostrando "0" en todo
- ❌ Placeholders genéricos
- ❌ Empty states sin personalidad
- ✅ **Solución**: Datos de ejemplo creíbles, empty states con contexto

---

## 🎨 PARTE 2: NUEVA PALETA DE COLORES

### Inspiración: Stripe + Linear + Notion

```
PRIMARY (Neutral):
  gray-900: #0f0f0f (backgrounds oscuros)
  gray-800: #1a1a1a (cards fondo)
  gray-700: #2d2d2d (hover subtle)
  gray-600: #525252 (text secondary)
  gray-500: #737373 (borders)
  gray-400: #a3a3a3 (disabled)
  gray-100: #f5f5f5 (backgrounds light)
  gray-50:  #fafafa (backgrounds muy light)

ACCENT (Azul sofisticado):
  blue-600: #2563eb → CAMBIAR A #1e5fdb (menos flat)
  blue-500: #3b82f6 → CAMBIAR A #4a9fff (más moderna)
  blue-400: #60a5fa (hover)

SEMANTIC:
  green-600: #15803d (success, activo)
  amber-600: #b45309 (warning, vencido pronto)
  red-600:   #dc2626 (error, vencido)
  cyan-600:  #0891b2 (info, neutral)
```

### Reglas de uso:
- Backgrounds: gray-900 / gray-50 (alternancia)
- Cards: gray-800 fondo + border gray-700
- Text: gray-900 primary, gray-600 secondary
- Accents: blue-600 para CTAs, green-600 para activos
- Borders: gray-600 (más visible que típico gray-200)

---

## ✍️ PARTE 3: REESCRITURA DE COPY

### Landing Page

#### ANTES (genérico):
```
"OnKey - Gestión Inmobiliaria Simplificada"
"Todo lo que necesitas para gestionar propiedades en un único lugar"
"Ahorra tiempo, reduce errores, crece tu negocio"
```

#### DESPUÉS (específico, humano):
```
"Controlá alquileres, sin Excel"
"Contratros que no expiran, inquilinos que pagan a tiempo, propiedades que se venden solas"
"De 50 inmuebles a 500. El mismo flujo."
```

### Dashboard - Empty State (sin propiedades)

#### ANTES:
```
"No hay propiedades"
[Botón: Agregar]
```

#### DESPUÉS:
```
"Todavía no hay propiedades aquí"
"Empezá agregando tu primer inmueble. En 2 minutos tenés rentas, contratos y alertas configuradas."
[Botón: Agregar primera propiedad]
```

### Cards de métricas

#### ANTES:
```
Propiedades: 0
Contratos: 0
Inquilinos: 0
Próximos vencimientos: 0
```

#### DESPUÉS:
```
8 propiedades | 12 rentas activas
"3 contratos vencen este mes"
"$45,000 en pagos pendientes"
"Próximo pago: 15 de abril (2 semanas)"
```

### Modal de crear propiedad

#### ANTES:
```
Dirección: [___]
Tipo: [Dropdown]
Precio: [___]
[Creat] [Cancel]
```

#### DESPUÉS:
```
¿Dónde está? (ej: Conesa 1200, Flores)
¿Qué tipo? (casa / depto / local / terreno)
¿A cuánto la alquilás? ($/mes)
[Crear] o [Cancelar]
```

---

## 🧩 PARTE 4: SISTEMA DE TIPOGRAFÍA

### Font Stack:
```css
/* Headings - Más peso, menos size */
h1: Geist, 32px, 700, line-height 1.2
h2: Geist, 24px, 600, line-height 1.3
h3: Geist, 18px, 600, line-height 1.4

/* Body */
body: Inter, 14px, 400, line-height 1.6
label: Inter, 12px, 500, line-height 1.5

/* Monospace (for IDs, prices, dates) */
code: "Monaco" / "Courier New", 13px, 400
```

### Jerarquía visual:
1. **Títulos de sección** (h2): 24px bold, color gray-900
2. **Labels** (h3): 14px semibold, color gray-700
3. **Body text**: 14px regular, color gray-600
4. **Meta text** (dates, ids): 12px regular, color gray-500, monospace

---

## 🎯 PARTE 5: COMPONENTES REDISEÑADOS

### 1. CARD DE PROPIEDAD (nuevo estilo)

```jsx
<div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition">
  {/* Header con acciones */}
  <div className="flex items-start justify-between mb-3">
    <h3 className="text-16 font-semibold text-gray-100">Conesa 1200</h3>
    <button className="text-gray-500 hover:text-gray-400">⋮</button>
  </div>
  
  {/* Meta info - compacta */}
  <div className="flex gap-3 mb-4 text-12 text-gray-500">
    <span>Depto 2-A</span>
    <span>•</span>
    <span>Zona: Flores</span>
  </div>
  
  {/* Status badge - claro*/}
  <div className="inline-flex px-2 py-1 bg-green-600/10 text-green-400 text-11 rounded">
    ✓ Ocupado
  </div>
  
  {/* Bottom - datos importantes */}
  <div className="mt-4 pt-4 border-t border-gray-700">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-11 text-gray-600">Renta mensual</p>
        <p className="text-16 font-semibold text-gray-100 font-mono">$12,000</p>
      </div>
      <div>
        <p className="text-11 text-gray-600">Inquilino</p>
        <p className="text-14 text-gray-300">Juan P.</p>
      </div>
    </div>
  </div>
</div>
```

**Mejoras:**
- Más blanco (gray-100) en texto importante
- Status con color + símbolo (no solo etiqueta)
- Datos en grid compacto (no filas)
- Meta info arriba, datos abajo (jerarquía natural)

---

### 2. BOTÓN (variantes contexttuales)

```jsx
/* PRIMARY - CTA importante */
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium 
  hover:bg-blue-700 active:bg-blue-800 transition">
  Agregar propiedad
</button>

/* SECONDARY - Acciones en contexto */
<button className="px-4 py-2 bg-gray-700 text-gray-100 rounded-lg font-medium 
  hover:bg-gray-600 transition">
  Editar
</button>

/* TERTIARY - Acciones leves */
<button className="px-4 py-2 bg-transparent text-blue-500 rounded-lg font-medium
  hover:bg-gray-800 transition">
  Ver más
</button>

/* DANGER - Acciones críticas */
<button className="px-4 py-2 bg-red-600/10 text-red-500 rounded-lg font-medium
  hover:bg-red-600/20 transition">
  Eliminar
</button>
```

**Reglas:**
- Padding dinámico: 8px-16px (más respirado)
- Sin sombras fuertes (solo hover)
- Texto siempre font-medium (600)

---

### 3. INPUT DE BÚSQUEDA (tipo Linear)

```jsx
<div className="relative">
  <input 
    type="text"
    placeholder="Buscar propiedad, inquilino..."
    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pl-10
      text-gray-100 placeholder-gray-500
      focus:border-blue-600 focus:bg-gray-800 transition
      text-14"
  />
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
</div>
```

**Mejoras:**
- Fondo gris (no blanco en dark mode)
- Icono integrado (no addon)
- Focus state más clara
- Placeholder descriptivo

---

### 4. TABLE (tipo Vercel/Stripe)

```jsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-gray-700">
      <th className="px-4 py-3 text-left text-12 font-semibold text-gray-500 uppercase">Propiedad</th>
      <th className="px-4 py-3 text-left text-12 font-semibold text-gray-500 uppercase">Estado</th>
      <th className="px-4 py-3 text-right text-12 font-semibold text-gray-500 uppercase">Renta</th>
    </tr>
  </thead>
  <tbody>
    {properties.map(p => (
      <tr key={p.id} className="border-b border-gray-700/50 hover:bg-gray-800/50 transition">
        <td className="px-4 py-3 text-gray-100 font-medium">{p.address}</td>
        <td className="px-4 py-3">
          <span className="px-2 py-1 bg-green-600/10 text-green-400 text-11 rounded">
            Ocupado
          </span>
        </td>
        <td className="px-4 py-3 text-right text-gray-300 font-mono">${p.rent}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Mejoras:**
- Headers uppercase + gray sub (menos peso visual)
- Hover sutil en filas
- Números en monospace lineal
- Borders sutiles, no grid completo

---

## 📊 PARTE 6: NUEVO LAYOUT DEL DASHBOARD

### ANTES (genérico):
```
┌─ Sidebar ─┬─────────────── Main ──────────────┐
│           │                                   │
│ Nav items │ [Banner]                          │
│           │ [4 cards iguales en row]          │
│           │ [2 charts grandes]                │
│           │ [Table con scroll]                │
│           │                                   │
└───────────┴───────────────────────────────────┘
```

### DESPUÉS (decisiones claras):
```
┌─ Sidebar ─┬─────────────── Main ──────────────┐
│           │                                   │
│ Nav       │ Barra superior:                   │
│           │ [Título] [Busca] [+Prop] [Menu]  │
│           │                                   │
│           │ SECCIÓN 1: Estado actual (MUY)   │
│           │ ┌────────────────────────────┐   │
│           │ │ 12 propiedades / $45k rentas│   │
│           │ │ 3 contratos vencen hoy     │   │
│           │ │ 2 pagos pendientes         │   │
│           │ └────────────────────────────┘   │
│           │                                   │
│           │ SECCIÓN 2: Acciones prioritarias |
│           │ - Vencimientos próximos          │
│           │ - Alertas (red/amber)            │
│           │                                   │
│           │ SECCIÓN 3: Datos (scroll)        │
│           │ Tabla de propiedades/contratos  │
│           │                                   │
└───────────┴───────────────────────────────────┘
```

### Reglas del nuevo layout:
1. **Top 50% del viewport**: Solo lo MÁS importante
   - Estado rápido (números clave)
   - Alertas críticas
   - CTA más común
   
2. **Bottom 50%**: Lo que puede scrollear
   - Tablas
   - Historial
   - Detalles

3. **Eliminar:**
   - Carrusel de welcome
   - Cards con 0 datos
   - Gráficos que no se usan
   - Colores innecesarios

---

## 🎯 PARTE 7: ESTADO POR SECCIÓN

### Dashboard — Métrica "Resumen"

```jsx
// ❌ ANTES (genérico)
<div className="grid grid-cols-4 gap-4">
  <Card number={12} label="Propiedades" />
  <Card number={8} label="Inquilinos" />
  <Card number={15} label="Contratos" />
  <Card number={3} label="Alertas" />
</div>

// ✅ DESPUÉS (específico)
<div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
  <div className="grid grid-cols-3 gap-6">
    {/* Col 1: Lo que importa YA */}
    <div>
      <p className="text-12 text-gray-600 uppercase mb-2">Rentas activas</p>
      <p className="text-28 font-bold text-gray-100">$182,000</p>
      <p className="text-12 text-green-400 mt-1">+$12,000 este mes</p>
    </div>
    
    {/* Col 2: Alertas en rojo */}
    <div>
      <p className="text-12 text-gray-600 uppercase mb-2">Vencimientos HOY</p>
      <p className="text-28 font-bold text-red-500">3</p>
      <p className="text-12 text-gray-400 mt-1">Requieren acción</p>
    </div>
    
    {/* Col 3: Progreso */}
    <div>
      <p className="text-12 text-gray-600 uppercase mb-2">Ocupancía</p>
      <p className="text-28 font-bold text-blue-400">92%</p>
      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
        <div style={{width: "92%"}} className="bg-blue-500 h-2 rounded-full" />
      </div>
    </div>
  </div>
</div>
```

**Cambios:**
- Metricas contextuales (no solo números)
- Números más grandes (más importantes)
- Meta información abajo (no arriba)
- Colores semánticos (rojo = acción, verde = bien)

---

### Vencimientos (Card con urgencia)

```jsx
<div className="space-y-3">
  {/* ROJO: Vencido hoy */}
  <div className="bg-red-600/5 border border-red-600/30 rounded-lg p-4 flex items-start gap-3">
    <span className="text-red-500 text-16">⚠</span>
    <div className="flex-1">
      <p className="text-14 font-semibold text-gray-100">Contrato vencido</p>
      <p className="text-12 text-gray-400">Juan P. - Conesa 1200 · Hoy a las 18:00</p>
    </div>
    <button className="text-blue-400 text-12 font-medium hover:text-blue-300">Renovar</button>
  </div>
  
  {/* AMBER: Vencimiento próximo */}
  <div className="bg-amber-600/5 border border-amber-600/30 rounded-lg p-4 flex items-start gap-3">
    <span className="text-amber-500 text-16">●</span>
    <div className="flex-1">
      <p className="text-14 font-semibold text-gray-100">Vence en 3 días</p>
      <p className="text-12 text-gray-400">María G. - Flores 450 · 15 de abril</p>
    </div>
    <button className="text-blue-400 text-12 font-medium">Revisar</button>
  </div>
</div>
```

**Patrón:**
- Color + símbolo = urgencia clara
- Información contexto en gris
- CTA siempre disponible

---

## 🧠 PARTE 8: FEATURES QUE FALTAN (para parecer real)

### Critical:
1. **Búsqueda global** (Cmd+K estilo Vercel)
   - Buscar propiedad, inquilino, contrato
   - Muestra resultados en categorías
   - Navegación por teclado

2. **Comandos rápidos** (context menu)
   - Click derecho: "Renovar contrato", "Enviar alerta", etc

3. **Notificaciones en tiempo real**
   - Pago confirmado → color cambia
   - Vencimiento en 24h → notification toast
   - Contrato modificado → alert

4. **Bulk actions**
   - Seleccionar múltiples propiedades
   - Acciones batch (cambiar estado, enviar notif, etc)

5. **Filtros persistentes**
   - User puede guardar "mis filtros"
   - Vuelve con los mismos filtros

### Nice-to-have:
6. **Dark mode toggle** (ya lo tienes, pero mejorar transiciones)
7. **Keyboard shortcuts**
   - `N` = Nueva propiedad
   - `/` = Búsqueda
   - `?` = Ayuda
8. **Undo/Redo** en acciones peligrosas
9. **Export a CSV** (tabla completa)
10. **Plantillas de contratos** (pre-rellenadas)

---

## 🎨 PARTE 9: MICRODETALLES QUE LO HACEN VER REAL

### Loading states
```jsx
// Skeleton cards mientras carga
<div className="bg-gray-800 h-40 rounded-lg animate-pulse" />

// Texto con shimmer
<div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
```

### Empty states con humor
```
"Aún no hay propiedades aquí"
"Es como tener una inmobiliaria vacía — tranquilo, es fácil llenarla."
[+ Agregar primera propiedad]
```

### Confirmaciones importantes
```
❌ ANTES: Alert "¿Eliminar?"
✅ DESPUÉS: 
   "¿Estás seguro que querés eliminar esta propiedad?"
   "Se eliminarán: 3 contratos, 12 pagos registrados"
   [Cancelar] [Eliminar - en rojo]
```

### Hover states (muy importante)
```css
/* Cards */
.card:hover {
  border-color: var(--color-gray-600);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

/* Rows de tabla */
.row:hover {
  background-color: var(--color-gray-800);
  cursor: pointer;
}

/* Links */
a:hover {
  text-decoration: underline;
  text-decoration-color: var(--color-blue-600);
}
```

### Estados de transición
```jsx
/* Cuando envías un pago */
"Procesando..." (2-3 seg)
"✓ Pago confirmado" (verde, 3 seg)
Vuelve a mostrar la lista

/* Editar contrato */
Formulario inline
[Guardar] [Cancelar]
```

---

## 📱 PARTE 10: RESPONSIVE (Mobile)

### Navigation Mobile
```
┌─ Hamburger ─────────────┐
│ ☰                       │ ← Tap abre nav
│                         │
│ Propiedades             │
│ Contratos               │
│ Inquilinos              │
│ Configuración           │
└─────────────────────────┘
```

### Dashboard Mobile
```
[← Propiedades]        ← header compacto
[Busca...] [+ New]     ← acciones principales

[Resumen - cards verticales]
 $182k rentas
 3 vencimientos
 92% ocupancía

[Tabla horizontal scrolleable]
```

**Reglas:**
- Una columna de contenido
- Headers sticky
- Bottom sheet para modales
- Touch targets >= 44px

---

## 🎯 PART 11: PALETA FINAL (COPY & PASTE)

### Tailwind Config (agregar a tailwind.config.js)

```javascript
module.exports = {
  theme: {
    colors: {
      transparent: 'transparent',
      gray: {
        50:   '#fafafa',
        100:  '#f5f5f5',
        200:  '#e5e5e5',
        500:  '#737373',
        600:  '#525252',
        700:  '#2d2d2d',
        800:  '#1a1a1a',
        900:  '#0f0f0f',
      },
      blue: {
        400:  '#60a5fa',
        500:  '#4a9fff',
        600:  '#1e5fdb',
        700:  '#1d4ed8',
      },
      green: {
        400:  '#4ade80',
        600:  '#15803d',
      },
      amber: {
        500:  '#f59e0b',
        600:  '#b45309',
      },
      red: {
        500:  '#ef4444',
        600:  '#dc2626',
      },
      cyan: {
        600:  '#0891b2',
      },
    },
    extend: {
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
}
```

---

## 💡 SUMMARY - CAMBIOS INMEDIATOS

### Top 5 cambios que hacen la mayor diferencia:

1. **Cambiar font a Geist/Inter** (más premium)
2. **Actualizar paleta: grises reales + azul sofisticado**
3. **Reescribir TODOS los textos** (nada genérico)
4. **Rediseñar cards**: menos iguales, más contexto
5. **Dashboard focus en lo importante**: estado rápido arriba

### Con solo esos 5 cambios, ya pasa de "template" a "startup real".

---

## 🚀 PRÓXIMOS PASOS

1. Implementar palette en Tailwind ✓
2. Cambiar Typography ✓
3. Rediseñar componentes principales ✓
4. Reescribir copy en UI ✓
5. Agregar search global ✓
6. Mejorar empty states ✓

Una vez hecho, tu app va a verse **premium, no genérica**.
