# Configuración de Google OAuth

## Pasos para configurar Google Sign-In

### 1. Crear un proyecto en Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto o seleccionar uno existente
3. En el menu de navegación, ir a "APIs y servicios" → "Biblioteca"
4. Buscar "Google Identity Services" y habilitarlo
5. También habilitar "Google+ API"

### 2. Crear credenciales (OAuth 2.0)

1. Ir a "APIs y servicios" → "Credenciales"
2. Hacer clic en "Crear credenciales" → "ID de cliente OAuth"
3. Si es la primera vez, configurar pantalla de consentimiento OAuth:
   - Tipo de usuario: Externo
   - Nombre de la app: OnKey
   - Email de soporte: tu-email@ejemplo.com
   - Scopes: De momento dejar los por defecto
   - Usuarios de prueba: (opcional)
4. Después de configurar la pantalla de consentimiento, volver a crear credenciales

### 3. Configurar dominio autorizado

1. En la creación de credenciales, seleccionar "Aplicación web"
2. Nombre: OnKey Frontend
3. En "URIs de redirección autorizados" agregar:
   - `http://localhost:5173` (desarrollo local)
   - `http://localhost:3000` (si usas otro puerto)
   - `https://tudominio.com` (producción)
4. Copiar el "ID de cliente" - lo necesitarás para el siguiente paso

### 4. Configurar variables de entorno

1. En la carpeta `frontend`, crear un archivo `.env.local`:
   ```
   VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui
   ```

2. Reemplazar `tu_client_id_aqui` con el ID de cliente obtenido en el paso anterior

### 5. Backend - Verificar tokens de Google

Para registrarse o loguarse con Google, el backend necesita:

1. Instalar `google-auth-library-python` (si usas Node.js: `google-auth-library-nodejs`)
2. En tu ruta de auth, agregar lógica para verificar el token JWT de Google:

```javascript
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    throw new Error('Token inválido');
  }
}
```

3. Usar esta función en tu ruta de login/register para verificar el token que envía el frontend

## Estructura de datos del token Google

El token JWT de Google contiene datos como:
- `email`: Email del usuario
- `given_name`: Nombre del usuario
- `family_name`: Apellido del usuario
- `picture`: URL de la foto de perfil
- `aud`: Audience (debe coincidir con tu Client ID)
- `iss`: Issuer (siempre "https://accounts.google.com")

## Testing

Para probar en desarrollo:
1. Asegúrate de que el `VITE_GOOGLE_CLIENT_ID` está configurado
2. Ejecuta `npm run dev` en la carpeta frontend
3. Verifica que en Google Cloud Console los "URIs de redirección" incluyan `localhost:5173`

## Notas importantes

- El usuario debe tener una cuenta de Google configurada en su navegador
- El token de Google es válido solo por un corto tiempo (generalmente 1 hora)
- Debes validar el token en el backend antes de crear/actualizar el usuario
- Los emails que aparecen son los que Google reconoce en el navegador del usuario
