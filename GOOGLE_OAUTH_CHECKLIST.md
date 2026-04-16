# 🔐 Configuración de Google OAuth - Checklist

## ✅ Lo que hemos agregado

### Frontend (React + Vite)
- ✅ Instaladas librerías: `@react-oauth/google` y `jwt-decode`
- ✅ `main.jsx`: Envuelto con `GoogleOAuthProvider`
- ✅ `Login.jsx`: 
  - Botón "Ingresar con Google" en la vista de login
  - Botón "Registrarse rápido con Google" en la vista de registro
  - Los emails de Google aparecen automáticamente (selecciona uno)
  - El formulario se auto-completa con datos de Google

### Backend (Node.js + Express)
- ✅ Instalada librería: `google-auth-library`
- ✅ Nueva ruta: `POST /api/auth/google-login` - login con Google token
- ✅ Nueva ruta: `POST /api/auth/google-register` - registro con Google token
- ✅ Función `verifyGoogleToken()` - verifica que el token sea válido
- ✅ `authService.js`: Actualizado para permitir crear usuarios sin contraseña (Google OAuth)

---

## 🚀 Pasos para activar Google OAuth

### 1️⃣ **Una sola vez: Configurar Google Cloud**

#### 1.1 - Crear proyecto en Google Cloud Console
1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto (o usa uno existente)
3. Nombre del proyecto: `OnKey` (o lo que prefieras)
4. Click en "Crear"

#### 1.2 - Habilitar APIs
1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca `"Google Identity Services API"` → **Habilitar**
3. Busca `"Google+ API"` → **Habilitar**

#### 1.3 - Crear pantalla de consentimiento OAuth
1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento"**
2. Elige **"Externo"** como tipo de usuario
3. Completa:
   - **Nombre de la app**: OnKey
   - **Email de soporte**: tu-email@ejemplo.com
   - **Email de contacto de desarrollador**: tu-email@ejemplo.com
4. Siguiente → Leave scopes as default → Siguiente → Guardar y continuar

#### 1.4 - Crear credenciales (Client ID)
1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Click en **"+ CREAR CREDENCIALES"** → **"ID de cliente OAuth"**
3. Tipo: **Aplicación web**
4. Nombre: `OnKey Frontend`
5. En **"URIs de redirección autorizados"**, agregar:
   - `http://localhost:5173` (desarrollo)
   - `http://localhost:3000` (si cambias puerto)
   - `https://tudominio.com` (producción)
6. Click en **"Crear"**
7. **📋 GUARDA EL CLIENT ID** - lo necesitarás en los pasos siguientes
8. Cierra el modal (ya no necesitas el secret para aplicaciones web)

---

### 2️⃣ **Configurar Frontend**

#### 2.1 - Crear archivo `.env.local`
En la carpeta `frontend/`, crea un archivo llamado `.env.local`:

```
VITE_GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
```

Reemplaza `TU_CLIENT_ID_AQUI` con el ID que copiaste en el paso 1.4

#### 2.2 - Reinicia el servidor
```bash
cd frontend
npm run dev
```

El navegador debería recargar y ahora verás los botones de Google.

---

### 3️⃣ **Configurar Backend**

#### 3.1 - Actualizar `.env` del backend
En `backend/.env`, agregar:

```
GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
```

**⚠️ IMPORTANTE**: Debe ser el **MISMO CLIENT ID** que configuraste en el paso 2.1

#### 3.2 - Reinicia el servidor backend
```bash
cd backend
npm run dev
```

---

## 🧪 Testing

### Pruebas en desarrollo

1. **Login con Google:**
   - Ve al formulario de login
   - Click en el botón "Ingresar con Google"
   - Aparecerá una ventana de Google
   - Selecciona o ingresa una cuenta de Google
   - Si el email YA EXISTE en la base de datos, iniciarás sesión
   - Si NO existe, verás: "Usuario no encontrado. Por favor, regístrate primero"

2. **Registro con Google:**
   - Ve al formulario de registro
   - Click en "Registrarse rápido con Google"
   - La ventana de Google aparecerá con las cuentas disponibles
   - Selecciona una cuenta
   - El formulario se auto-completará con:
     - **Nombre**: del perfil de Google
     - **Apellido**: del perfil de Google  
     - **Email**: confirmado de Google
   - Completa y envía el formulario para crear la cuenta
   - Se creará automáticamente una "inmobiliaria" con el nombre del usuario

---

## 🔄 Flujo de Datos

### Login con Google
```
1. Usuario hace clic en "Ingresar con Google"
2. Google genera un JWT (token)
3. Frontend envía el token a: POST /api/auth/google-login
4. Backend verifica el token con Google
5. Backend busca el usuario en la base de datos
6. Si existe → genera JWT propio → retorna token + usuario + tenant
7. Si NO existe → retorna error 401 "Usuario no encontrado"
```

### Registro con Google
```
1. Usuario hace clic en "Registrarse rápido con Google"
2. Google genera un JWT
3. Frontend auto-completa el formulario con datos de Google
4. Usuario completa y hace clic en "Crear cuenta"
5. Frontend envía: credential (JWT de Google) + datos del formulario
6. Backend: POST /api/auth/google-register
7. Backend verifica token con Google
8. Crea: nueva inmobiliaria (tenant) + usuario admin + asigna plan Starter
9. Email se marca como verificado automáticamente (de Google)
10. Retorna: token + usuario → usuario inicia sesión automáticamente
```

---

## ⚙️ Configuración avanzada

### Cambiar el dominio autorizado
Si cambias el dominio frontend (ej: otro puerto, otra URL):
1. Ve a Google Cloud Console → Credenciales
2. Haz clic en tu "ID de cliente OAuth"
3. Agrega la nueva URL en "URIs de redirección autorizados"
4. Guarda

### Múltiples ambientes (dev/prod)
Puedes tener múltiples Client IDs:
1. Crea credenciales separadas en Google Cloud para cada ambiente
2. En el `frontend/.env.local` usa el Client ID de desarrollo
3. En `frontend/.env.production`, agrega el Client ID de producción
4. En el backend, configura `GOOGLE_CLIENT_ID` según el ambiente

---

## ❌ Troubleshooting

### Error: "GOOGLE_CLIENT_ID no está configurado"
- ✅ Verifica que `backend/.env` tenga `GOOGLE_CLIENT_ID=...`
- ✅ Reinicia el servidor backend

### Error: "Client ID is required"
- ✅ Verifica que `frontend/.env.local` tenga `VITE_GOOGLE_CLIENT_ID=...`
- ✅ Reinicia `npm run dev`

### Error: "Token inválido" en backend
- ✅ Verifica que ambos (frontend y backend) tengan el **MISMO** Client ID
- ✅ Verifica que en Google Cloud Console tengas autorizados los URIs correctos

### El botón de Google no aparece
- ✅ Abre la consola (F12) y revisa si hay errores
- ✅ Verifica que Vite está corriendo con la variable de entorno
- ✅ Verifica que el GoogleOAuthProvider está en `main.jsx`

### "Esta URL no se puede usar como URI de redirección"
- ✅ En Google Cloud Console, agrega la URL exactamente como aparece en el error
- ✅ Incluye el protocolo (`http://` o `https://`)
- ✅ Incluye el puerto si es necesario (`:5173`)

---

## 📚 Referencias

- [Google Identity Services Documentation](https://developers.google.com/identity)
- [React OAuth Google Library](https://www.npmjs.com/package/@react-oauth/google)
- [Google Auth Library for Node.js](https://github.com/googleapis/google-auth-library-nodejs)

---

## ✨ ¿Qué sigue?

Después de configurar Google OAuth:
1. Personalizar el flujo de registro (añadir más campos)
2. Agregar foto de perfil de Google
3. Conectar redes sociales adicionales (Facebook, GitHub, etc.)
4. Agregar "Olvidé mi contraseña" para usuarios con contraseña

