# Copy Rediseñado — OnKey Sistema Completo

## Landing Page

### ANTES:
- "OnKey - Gestión Inmobiliaria Simplificada"
- "Todo lo que necesitas para gestionar propiedades en un único lugar"
- "Ahorra tiempo, reduce errores, crece tu negocio"

### DESPUÉS:
- "Controlá tus alquileres sin Excel"
- "Contratos que no expiran sin darte cuenta, inquilinos que pagan a tiempo, propiedades que se venden solas"
- "De 10 inmuebles a 1000. El mismo flujo."

---

## Login

### Campo Email - Placeholder
- ANTES: "usuario@ejemplo.com"
- DESPUÉS: "tucuenta@ejemplo.com"

### Campo Password - Placeholder
- ANTES: "••••••••"
- DESPUÉS: "Mínimo 6 caracteres"

### Botón Submit
- ANTES: "Ingresar"
- DESPUÉS: "Acceder"

### Link "No tenés cuenta?"
- ANTES: "Registrarse"
- DESPUÉS: "Crear cuenta gratis"

---

## Register (Signup)

### Título
- ANTES: "Crear cuenta"
- DESPUÉS: "Empecemos" (más amigable)

### Campo Nombre
- Label: "¿Cómo te llamás?"
- Placeholder: "Juan"

### Campo Inmobiliaria
- Label: "¿Cómo se llama tu inmobiliaria?"
- Placeholder: "Ej: Propiedades del Centro"

### Campo Email
- Label: "Email de tu cuenta"
- Placeholder: "tu@email.com (usaremos este para contactarte)"

### Campo Password
- Label: "Contraseña segura"
- Placeholder: "Mínimo 6 caracteres"

### Botón Submit
- ANTES: "Crear cuenta"
- DESPUÉS: "Crear mi cuenta"

### Success Message
- ANTES: "¡Registro exitoso!"
- DESPUÉS: "¡Bienvenido!"

### Confirmación
- ANTES: "Te enviamos un mail de confirmación a..."
- DESPUÉS: "Abrí tu email y hace clic en el botón para verificar. Si no lo ves, revisá SPAM."

---

## Dashboard

### Header
- ANTES: "Dashboard"
- DESPUÉS: "Bienvenida 👋" (más personal)

### Métrica Rentas
- ANTES: "Rentas totales"
- DESPUÉS: "Rentas activas"

### Métrica Ocupancía
- ANTES: "Ocupancía"
- DESPUÉS: "Ocupancía" (igual, pero con % visible)

### Empty State (sin propiedades)
- ANTES: "No hay propiedades · [Agregar]"
- DESPUÉS: 
  - Título: "Todavía no hay propiedades"
  - Descripción: "Empezá agregando tu primer inmueble. De ahí fluye todo: rentas, inquilinos, alertas, documentos."
  - Botón: "Agregar primera propiedad"

---

## Properties (Listado)

### Encabezado
- ANTES: "Propiedades"
- DESPUÉS: "Propiedades" + stats (ej: "12 total • 8 ocupadas • $85,000/mes")

### Botón Principal
- ANTES: "Nueva propiedad"
- DESPUÉS: "+ Agregar propiedad"

### Card de Propiedad - Estado
- ANTES: "Ocupado" / "Desocupado"
- DESPUÉS: "✓ Ocupado" / "○ Desocupado"

### Card de Propiedad - Labels
- ANTES: "Renta mensual" / "Inquilino"
- DESPUÉS: (igual pero con iconos visuales)

### Filtro
- ANTES: (no había)
- DESPUÉS: Botones: "Todas (12) • Ocupadas (8) • Desocupadas (4)"

### Empty State
- ANTES: "No hay propiedades"
- DESPUÉS: 
  - Si sin búsqueda: "Todavía no hay propiedades · Empezá agregando..."
  - Si con búsqueda: "No encontramos propiedades · Intentá con otra búsqueda"

---

## Leases (Contratos)

### Encabezado
- ANTES: "Contratos"
- DESPUÉS: "Contratos" + stats (ej: "15 activos • 2 vencidos • 3 por vencer")

### Alert - Vencido Hoy
- ANTES: "Contrato vencido"
- DESPUÉS: "🚨 1 contrato venció HOY · Estos inquilinos necesitan renovar inmediatamente"

### Alert - Vence Pronto
- ANTES: "Vencimiento próximo"
- DESPUÉS: "● 3 contratos vencen en los próximos 30 días · El primero: [fecha]"

### Botón Principal
- ANTES: "Nuevo contrato"
- DESPUÉS: "+ Nuevo contrato"

### Tabla - Status
- ANTES: "Estado: Activo/Vencido"
- DESPUÉS: 
  - Si vencido: "⚠ Vencido" (rojo)
  - Si vence en 7 días: "⚡ Termina en 3d" (rojo)
  - Si vence en 30 días: "● Termina en 15d" (amber)
  - Si activo: "✓ Activo" (verde)

### Tabla - Headers
- ANTES: "Propiedad / Inquilino / Vencimiento / Renta"
- DESPUÉS: (mismo, pero uppercase y más espaciado)

### Empty State
- ANTES: "No hay contratos"
- DESPUÉS: "Todavía no hay contratos · Empezá creando tu primer contrato"

---

## Alertas Generales

### Confirmación de Eliminación
- ANTES: "¿Estás seguro?"
- DESPUÉS: 
  - Título: "¿Está seguro que querés eliminar?"
  - Descripción: "Se eliminarán todos los registros asociados. Esta acción no se puede deshacer."
  - Botón: "Eliminar" (en rojo)

### Error Genérico
- ANTES: "Error al XXX"
- DESPUÉS: "Algo salió mal · Intentá de nuevo o contactá soporte"

### Success Toast
- ANTES: "¡Hecho!"
- DESPUÉS: "✓ Cambios guardados"

### Loading State
- ANTES: "Cargando..."
- DESPUÉS: (icon spinner sin texto, o "Procesando...")

---

## Botones Generales

### Botón Primario
- ANTES: "Guardar" / "Aceptar" / "Continuar"
- DESPUÉS: Más específico: "Guardar propiedad" / "Renovar contrato" / "Enviar notificación"

### Botón Secundario
- ANTES: "Cancelar"
- DESPUÉS: "Cancelar" o "Volver"

### Botón Tertiary (links)
- ANTES: "Ver más"
- DESPUÉS: "Ver detalles" / "Revisar" / "Ver →"

---

## Placeholders & Hints

### Email Input
- ANTES: "usuario@ejemplo.com"
- DESPUÉS: "tu@email.com"

### Dirección Input
- ANTES: "Dirección"
- DESPUÉS: "Ej: Conesa 1200, Flores, Bs As"

### Búsqueda
- ANTES: "Buscar..."
- DESPUÉS: "Buscar propiedad, inquilino, contrato..."

---

## Microcopy (Textos Pequeños)

### Fecha de Vencimiento
- ANTES: "Fecha de vencimiento: 2026-04-15"
- DESPUÉS: "Vence el 15 de abril" (más natural)

### No. Contrato
- ANTES: "ID: 12345"
- DESPUÉS: "Contrato #12345" (más natural)

### Inquilino
- ANTES: "Inquilino: Juan P."
- DESPUÉS: "Inquilino · Juan P." (más limpio)

### Estado
- ANTES: "Estado: Activo"
- DESPUÉS: "✓ Activo" (visual + texto)

---

## Acciones Contextuales

### Tooltip en Hover
- ANTES: (sin tooltip)
- DESPUÉS: Aparece tooltip: "Editar", "Eliminar", "Ver detalles", etc.

### Confirmación Peligrosa
- ANTES: "¿Eliminar?"
- DESPUÉS: "¿Está seguro que querés eliminar? No se puede deshacer."

---

## Validaciones

### Email Inválido
- ANTES: "Email inválido"
- DESPUÉS: "Ese email no parece válido"

### Campo Requerido
- ANTES: "Campo requerido"
- DESPUÉS: "Este campo no puede estar vacío"

### Password Débil
- ANTES: "La contraseña es muy corta"
- DESPUÉS: "Necesitas al menos 6 caracteres"

---

## Onboarding (First Time)

### Step 1: Bienvenida
- ANTES: "¡Bienvenido!"
- DESPUÉS: "¡Hola! Vamos a configurar tu inmobiliaria en 2 minutos."

### Step 2: Primera Propiedad
- ANTES: "Agregar propiedad"
- DESPUÉS: "Empecemos agregando tu primer inmueble · Luego vienen contratos e inquilinos."

### Step 3: Primer Contrato
- ANTES: "Agregar contrato"
- DESPUÉS: "Ahora creemos tu primer contrato · Así OnKey sabe quién paga qué."

### Skip
- ANTES: "Saltar"
- DESPUÉS: "Recordarme después" / "Saltar tutorial"

---

## Email Wake-up

### Asunto
- ANTES: "Verificá tu cuenta en OnKey"
- DESPUÉS: "Bienvenido a OnKey — verifica tu email en 1 minuto"

### Botón CTA
- ANTES: "Verificar mi cuenta"
- DESPUÉS: "Verificar email" o "Acceder a OnKey"

### Footer
- ANTES: "Si no creaste una cuenta, ignora este email"
- DESPUÉS: "¿No fuiste vos? Solo ignora este email."

---

## Resumen: Cambios de Tono

| ANTES | DESPUÉS |
|-------|---------|
| "Gestionar" | "Controlá" / "Administrá" |
| "Propiedad" | "Inmueble" / "Propiedad" (contextual) |
| "Contrato" | "Contrato" (igual, es claro) |
| "Inquilino" | "Inquilino" (igual) |
| "Genérico marketing" | "Específico y directo" |
| "Fórmulas estándar" | "Lenguaje conversacional" |
| "Muchas palabras" | "Conciso, al punto" |
| "sin emoji" | "Emoji contextual (pero no excesivo)" |
| "Pasivo" | "Activo/imperativo" |

---

### Principios Core del Nuevo Copy

1. **Específico**: Nunca "Agregar". Siempre "Agregar propiedad" o "Agregar contrato"
2. **Directo**: "Controlá" en lugar de "Puedes gestionar"  
3. **Urgencia clara**: Vencimientos en ROJO, no neutral
4. **Humano**: "Bienvenida 👋" en lugar de "Dashboard"
5. **Contextual**: Cambia según lo que hace el usuario
6. **Non-BS**: Nada de "Simpl ificamos tu gestión" — mostramos qué hace
7. **Acción orientada**: Cada texto dice qué pasa al hacer clic

---

Este documento puede usarse como **guía de estilo de copy** para todo el app.
