# Testing & Validation — OnKey Rediseño

## 🧪 TESTING CHECKLIST

### 1. BASE VISUAL

- [ ] Cargar app en navegador (http://localhost:5173)
- [ ] Verificar que la fuente cambió a GeistMono (más limpia)
- [ ] Verificar colores: grises más reales, azul menos flat
- [ ] Verificar que el logo/header tenga mejor peso visual

### 2. LANDING PAGE

- [ ] Botón "Registrarse" es azul y prominente
- [ ] Botón "Iniciar sesión" es texto/outline gris
- [ ] Textos: "Controlá alquileres, sin Excel" (no genérico)
- [ ] CTA principal: "Probar gratis 14 días"
- [ ] CTA secundaria: "¿Ya tenés cuenta?"
- [ ] Checkboxes de beneficios con iconos

### 3. LOGIN

- [ ] Input email: placeholder "tu@email.com"
- [ ] Input password: placeholder "Mínimo 6 caracteres"
- [ ] Botón: "Acceder" (no "Ingresar")
- [ ] Link "Crear cuenta gratis" lleva a registro
- [ ] Testing credentials visibles y claros

### 4. REGISTRO

- [ ] Título: "Empecemos" (no "Crear cuenta")
- [ ] Label "¿Cómo te llamás?" (no "Nombre")
- [ ] Label "¿Cómo se llama tu inmobiliaria?" 
- [ ] Botón: "Crear mi cuenta"
- [ ] Success message: "¡Bienvenido!" con instrucción de email

### 5. DASHBOARD REDESIGNED

- [ ] Header: "Bienvenida 👋"
- [ ] Desc: "Status de tu inmobiliaria hoy"
- [ ] Botón: "+ Agregar propiedad"
- [ ] Búsqueda: "Buscar propiedad, inquilino, contrato..."
- [ ] 3 métricas principales:
  - "Rentas activas" (en verde/azul)
  - "Vencimientos HOY" (en rojo si > 0)
  - "Ocupancía %" (con progreso bar)
- [ ] Si hay vencimientos: AlertCard rojo "🚨 3 contratos venció HOY"
- [ ] Si sin alertas: "✓ Todo en orden"
- [ ] Sección "Propiedades" con cards nuevas
- [ ] Table de contratos mejorada
- [ ] Empty states con ícono + descripción + botón

### 6. PROPERTIES REDESIGNED

- [ ] Header con stats: "12 total • 8 ocupadas • $85k/mes"
- [ ] Búsqueda: "Buscar por dirección, zona..."
- [ ] Filtros: "Todas (12) • Ocupadas (8) • Desocupadas (4)"
- [ ] Cards de propiedad:
  - [ ] Dirección en 16px bold
  - [ ] Meta info en gris pequeño (zona, tipo)
  - [ ] Badge: "✓ Ocupado" (verde) o "○ Desocupado" (gris)
  - [ ] Bottom: Renta + Inquilino en grid
  - [ ] Hover: botones Edit + Delete aparecen
- [ ] Sin propiedades: Empty state con emoji casa
- [ ] Confirmación de delete con detalle

### 7. LEASES REDESIGNED

- [ ] Header con stats: "15 activos • 2 vencidos • 3 por vencer"
- [ ] AlertCard si hay vencidos: "🚨 2 contratos vencieron"
- [ ] AlertCard si vencen pronto: "● 3 vencen en 30 días"
- [ ] Si todo ok: "✓ Todos al día"
- [ ] Búsqueda: "Buscar inquilino o propiedad..."
- [ ] Filtros: "Activos (15) • Vencidos (2) • Todos (17)"
- [ ] Table:
  - [ ] Headers: UPPERCASE pequeño, gris
  - [ ] Inquilino colonna
  - [ ] Propiedad columna
  - [ ] Renta en monospace
  - [ ] Vencimiento con badge color:
    - [ ] Rojo si vencido
    - [ ] Rojo si vence en ≤7 días
    - [ ] Amber si vence en ≤30 días
    - [ ] Verde si activo
  - [ ] Row hover: slight background change
- [ ] Botones Edit + Delete a la derecha
- [ ] Confirmación de delete

### 8. BÚSQUEDA GLOBAL (Cmd+K)

- [ ] Presionar Cmd+K (Mac) o Ctrl+K (Windows)
- [ ] Modal abre en top center
- [ ] Input autofocused
- [ ] Placeholder: "Buscar propiedad, contrato, inquilino..."
- [ ] Empezar a tipear:
  - [ ] Aparecen resultados vivos (no delay)
  - [ ] Categorizados: Properties / Leases / Tenants
  - [ ] Se muestran máx 5 por categoría
  - [ ] Descripción contextual (zona, renta, vencimiento)
- [ ] Click en resultado → va a esa sección
- [ ] ESC cierra modal
- [ ] Botón en bottom right si modal cerrado

### 9. COMPONENTES REDISEÑADOS

#### BtnPrimary
- [ ] Color azul (#1e5fdb)
- [ ] Hover: azul más oscuro
- [ ] Padding: 8-16px
- [ ] Border radius: 8px
- [ ] Font weight: 500

#### BtnSecondary  
- [ ] Color fondo gris (#2d2d2d)
- [ ] Hover: gris más oscuro
- [ ] Texto gris claro

#### Cards
- [ ] Fondo: #1a1a1a
- [ ] Border: 1px #2d2d2d
- [ ] Hover: border se aclara ligeramente
- [ ] Padding: 16px
- [ ] Border radius: 8px

#### AlertCard
- [ ] Variantes: error (red), warning (amber), success (green), info (cyan)
- [ ] Icon + Title + Description + Action
- [ ] Colores semánticos correctos

#### EmptyState
- [ ] Ícono grande (48px)
- [ ] Título en 18px bold
- [ ] Descripción descriptiva
- [ ] Botón CTA primario

### 10. RESPONSIVO

- [ ] Desktop (1440px+): layout normal
- [ ] Tablet (768px): 2 columnas en cards
- [ ] Mobile (375px):
  - [ ] 1 columna
  - [ ] Búsqueda toma full width
  - [ ] Botones full width o apilados
  - [ ] Top sheet para modales

### 11. DARK MODE (si lo tienes)

- [ ] Colores aplican correctamente
- [ ] Contraste es legible
- [ ] No hay elementos blancos puros (usar grays)

### 12. COPY & MICROCOPY

- [ ] Landing: "Controlá alquileres, sin Excel"
- [ ] Dashboard: "Estado actual" (no "Resumen")
- [ ] Empty states:  descriptivos + CTAs claros
- [ ] Botones: específicos (no "Guardar", sino "Guardar propiedad")
- [ ] Alerts: urgencia clara con emoji + texto

### 13. PERFORMANCE

- [ ] Dashboard carga en <2s
- [ ] Búsqueda global responde al instante
- [ ] Cards no freezean al hover
- [ ] Transiciones suaves (no lag)

### 14. ACCESIBILIDAD

- [ ] Colores: suficiente contraste
- [ ] Focus states visibles en inputs/botones
- [ ] Textos alt en imagenes
- [ ] Labels unidas a inputs

---

## 🚀 ANTES QUE EMPIECES A TESTEAR

1. **Termina el setup técnico:**
   - [ ] Instalar Geist: `npm install geist`
   - [ ] Actualizar tailwind.config.js ✓
   - [ ] Actualizar src/index.css ✓

2. **Reemplazar componentes en App.jsx:**
   - [ ] Cambiar `Dashboard` → `DashboardRedesigned`
   - [ ] Cambiar `Properties` → `PropertiesRedesigned`
   - [ ] Cambiar `Leases` → `LeasesRedesigned`
   - [ ] Importar `<GlobalSearch />` y pasarle props

3. **Reiniciar dev server:**
   ```bash
   npm run dev
   ```

4. **Limpiar cache:**
   - [ ] Hard refresh: Ctrl+Shift+R
   - [ ] Borrar localStorage si hay problemas: F12 → Application → Clear

---

## 📸 ANTES vs DESPUÉS (Visuales que deberías notar)

### Tipografía
- ❌ ANTES: Inter genérica, tamaños estándar
- ✅ DESPUÉS: Geist premium, jerarquía clara, 24px/32px headings

### Colores
- ❌ ANTES: Azul #2563eb plano, grises genéricos
- ✅ DESPUÉS: Azul #1e5fdb sofisticado, grises con depth (#1a1a1a - #fafafa)

### Espaciado
- ❌ ANTES: Caótico, sin sistema
- ✅ DESPUÉS: 8px grid consistente, tarjetas respiradas

### Cards
- ❌ ANTES: Todas iguales, sin contexto
- ✅ DESPUÉS: Variadas, con datos importantes visibles, hover states

### Copy
- ❌ ANTES: "Gestiona propiedades en un lugar"
- ✅ DESPUÉS: "Controlá alquileres, sin Excel"

---

## 🐛 PROBLEMAS COMUNES ESPERADOS

### Problema: "No veo Geist"
**Solución:** 
- Asegurate que `tailwind.config.js` tenga `fontFamily: { sans: ['GeistMono', ...] }`
- Reinicia VS Code
- Hard refresh del navegador

### Problema: "Colores se ven raros"
**Solución:**
- Verifica que los colores en `tailwind.config.js` estén correctos
- Asegurate que no hay CSS conflictivo en `App.css` u otros

### Problema: "Botones se ven planos"
**Solución:**
- Agrega el className correcto (@apply o inline)
- Verifica que la paleta de colores se aplicó

### Problema: "Search no funciona (Cmd+K)"
**Solución:**
- Asegurate que `<GlobalSearch />` está en App.jsx
- Verifica en console que no hay errores de import
- Prueba con Ctrl+K en Windows

---

## ✅ VALIDACIÓN FINAL

Una vez pases todo el checklist, responde estas preguntas:

1. **¿Se ve como un producto real?** (no template genérico)
2. **¿Es claro qué debe hacer cada botón?** (copy específico)
3. **¿Las alertas son obviamente urgentes?** (colores correctos)
4. **¿El espaciado respira bien?** (no apiñado)
5. **¿La búsqueda es rápida?** (Cmd+K responsive)
6. **¿Los empty states son útiles?** (dan contexto + acción)

Si respondés SÍ a todas → **¡ESTÁ LISTO!**

---

## 🎯 DEBUG RÁPIDO

```javascript
// En console:
// Ver si Geist está cargado:
window.getComputedStyle(document.body).fontFamily

// Deber ser: "GeistMono", -apple-system, BlinkMacSystemFont, ...
```

---

Buena suerte con el testing. Si algo no se ve bien, revisa primero:
1. ¿El CSS se cargó? (F12 → Sources)
2. ¿No hay conflictos? (F12 → Inspect element)
3. ¿El archivo está guardado? (Ctrl+S)
