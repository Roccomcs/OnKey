# 🚀 GUÍA RÁPIDA DE IMPLEMENTACIÓN

## ⚡ Acciones Inmediatas (15 minutos)

### 1. Migrar Contraseña del Admin

```bash
# Terminal en backend/
cd backend

# Opción A: Generar contraseña aleatoria (RECOMENDADO)
node resetAdminPassword.js admin@localhost

# Opción B: Establecer contraseña específica
node resetAdminPassword.js admin@localhost "Tu!Contraseña!Segura2024"

# ✅ Copiar y guardar la contraseña en un gestor de contraseñas
```

**Importancia**: CRÍTICO — La contraseña 'admin123' está en todas las listas de ataques

---

### 2. Migrar Email del Admin (OPCIONAL pero RECOMENDADO)

```bash
# Si quieres migrar admin@localhost a un email real
# Primero conectar a la BD

mysql -u root -p -h 127.0.0.1 inmobiliaria << EOF
UPDATE usuarios SET email='admin@tudominio.com' WHERE email='admin@localhost';
EXIT;
EOF

# Luego cambiar la contraseña del nuevo email
node resetAdminPassword.js admin@tudominio.com "Tu!Contraseña!Nueva2024"
```

---

## 📦 Verificar SEO (5 minutos)

### robots.txt y sitemap.xml

```bash
# Verificar robots.txt
curl -I http://localhost:3001/robots.txt

# Verificar sitemap.xml
curl http://localhost:3001/sitemap.xml

# Debería ver XML con URLs públicas
```

✅ Ya está implementado en el backend

---

## 🛡️ Integración CSRF en Frontend (15-30 minutos)

### Paso 1: Actualizar useAuth.js

En `frontend/src/hooks/useAuth.js`:

```javascript
import { useCSRFToken } from './useCSRFToken';

export function useAuth() {
  const { csrfToken, saveToken, clearToken } = useCSRFToken();
  
  const login = useCallback(async (tenantName, email, password) => {
    // ... código de login ...
    
    // AGREGAR ESTO:
    if (data.csrfToken) {
      saveToken(data.csrfToken);
    }
    
    return { token: data.token, usuario: data.usuario, tenant: data.tenant };
  }, []);

  const logout = useCallback(async () => {
    // AGREGAR ESTO:
    clearToken();
    
    // ... resto del logout ...
  }, []);

  return { /* ... */ };
}
```

### Paso 2: Usar fetchWithCSRF en API Calls

Buscar todos los `fetch` en el código y reemplazar los POST/PUT/DELETE:

```javascript
// ANTES
const response = await fetch('/api/properties', {
  method: 'POST',
  body: JSON.stringify(data),
});

// DESPUÉS
import { useCSRFToken } from '../hooks/useCSRFToken';

export function MyComponent() {
  const { fetchWithCSRF } = useCSRFToken();
  
  const response = await fetchWithCSRF('/api/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

**Archivos a actualizar**:
- `frontend/src/pages/Properties.jsx`
- `frontend/src/pages/Contacts.jsx`
- `frontend/src/pages/Leases.jsx`
- Cualquier otro componente que haga POST/PUT/DELETE

### Paso 3: Agregar validación de contraseña al registro

En `frontend/src/pages/register.jsx`:

```jsx
import { PasswordValidator } from '../hooks/usePasswordValidation';

export function RegisterPage() {
  const [password, setPassword] = useState('');
  
  return (
    <form>
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
      />
      
      {/* AGREGAR ESTO: */}
      <PasswordValidator password={password} />
      
      <button>Registrar</button>
    </form>
  );
}
```

---

## 🎯 Agregar Meta Tags a Páginas (10 minutos)

### Landing Page

En `frontend/src/pages/LandingPage.jsx`:

```jsx
import { MetaTags } from '../components/MetaTags';

export function LandingPage() {
  return (
    <>
      <MetaTags 
        title="onKey — Gestión de Propiedades para Inmobiliarias"
        description="Plataforma digital para gestionar propiedades, contratos, inquilinos y propietarios. Todo en un solo lugar."
        image="https://www.onkey.com.ar/og-image.jpg"
        url="https://www.onkey.com.ar"
      />
      
      {/* Contenido */}
    </>
  );
}
```

### Otras páginas

En `frontend/src/pages/Leases.jsx`:

```jsx
import { MetaTags } from '../components/MetaTags';

export function Leases() {
  return (
    <>
      <MetaTags 
        title="Contratos | onKey"
        description="Gestiona tus contratos de alquiler: fechas, montos, ajustes por inflación"
        url="https://www.onkey.com.ar/leases"
      />
      {/* ... */}
    </>
  );
}
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### Backend
- [ ] `node resetAdminPassword.js admin@localhost` ejecutado exitosamente
- [ ] `curl http://localhost:3001/robots.txt` retorna XML
- [ ] `curl http://localhost:3001/sitemap.xml` retorna XML
- [ ] No hay errores en logs del servidor

### Frontend
- [ ] Importaciones de nuevos hooks funcionan
- [ ] No hay errores en consola del navegador
- [ ] Login genera csrfToken correctamente
- [ ] PasswordValidator muestra validación en tiempo real

### Integración
- [ ] POST/PUT/DELETE incluyen `X-CSRF-Token` en headers
- [ ] Meta tags aparecem en DevTools de navegador
- [ ] robots.txt visible en `https://tudominio.com/robots.txt`
- [ ] sitemap.xml visible en `https://tudominio.com/sitemap.xml`

---

## 🔍 VERIFICACIÓN FINAL

### Probar en navegador

```javascript
// En DevTools Console:

// 1. Verificar CSRF token después del login
localStorage.getItem('csrfToken');

// 2. Hacer un request y verificar header
fetch('/api/properties', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': localStorage.getItem('csrfToken'),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ /* datos */ }),
});

// 3. Ver meta tags
document.querySelector('meta[name="description"]');
document.querySelector('[property="og:title"]');
```

### Verificar desde fuera

```bash
# SEO meta tags
curl https://www.onkey.com.ar | grep -i 'meta name="description"'
curl https://www.onkey.com.ar | grep -i 'og:title'

# Robots y sitemap
curl -I https://www.onkey.com.ar/robots.txt
curl -I https://www.onkey.com.ar/sitemap.xml

# Usar herramientas online
# https://www.seobility.net/en/seocheck/
# https://www.seochecker.org/
```

---

## ⚠️ TROUBLESHOOTING

### Error: "Token CSRF faltante"
```
→ Solución: Importar useCSRFToken en el componente
→ Verificar que fetchWithCSRF se use para POST/PUT/DELETE
```

### Error: "Token CSRF expirado"
```
→ Solución: Hacer logout y login nuevamente para regenerar token
```

### Meta tags no aparecen en compartir en redes
```
→ Solución: Usar Facebook Sharing Debugger para limpiar caché
→ Link: https://developers.facebook.com/tools/debug/sharing/
```

### robots.txt retorna 404
```
→ Solución: Verificar que el servidor accede a frontend/public/robots.txt
→ Verificar permiso de lectura del archivo
```

---

## 📞 SOPORTE

Si tienen dudas:
1. Revisar `SOLUCIONES_AUDITORIA.md` para detalles técnicos
2. Revisar código comentado en los archivos nuevos
3. Ejecutar `node resetAdminPassword.js` sin argumentos para ver ayuda

