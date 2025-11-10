# 🔐 Configuración de Autenticación Real - API Backend

## 📋 Cambios Realizados

Se ha configurado la aplicación para usar **autenticación real** con el backend de Spring Boot en lugar de la simulación.

## 🚀 Configuración del Backend

### Requisitos:
1. **Servidor Spring Boot** ejecutándose en `http://localhost:8080`
2. **Endpoint de autenticación** disponible en `/api/auth/login`
3. **Credenciales de prueba** configuradas en el backend

### Estructura de Request/Response:

**Request POST `/api/auth/login`:**
```json
{
  "email": "admin@empresa.com",
  "password": "admin123"
}
```

**Response esperada:**
```json
{
  "mensaje": "Login exitoso",
  "usuarioId": 1,
  "nombre": "Admin Sistema", 
  "email": "admin@empresa.com",
  "rol": "ADMIN",
  "activo": true
}
```

## 🛠️ Archivos Modificados

### 1. **authService.js**
- ✅ Eliminada simulación de autenticación
- ✅ Configurado para usar endpoint real `/api/auth/login`  
- ✅ Mapeo correcto de la respuesta del backend
- ✅ Manejo de errores mejorado

### 2. **api.js** 
- ✅ URL base actualizada a Spring Boot (`localhost:8080`)
- ✅ Headers de autorización configurados
- ✅ Manejo de tokens de sesión

### 3. **Login.jsx**
- ✅ Mensajes de error más específicos
- ✅ Debugging mejorado para conexión
- ✅ UX mejorada para errores de red

## 🧪 Cómo Probar la Conexión

### Opción 1: Usar la Aplicación
1. Inicia el backend de Spring Boot en `http://localhost:8080`
2. Ejecuta el frontend: `npm run dev`
3. Ve a la página de login
4. Usa las credenciales:
   - **Email:** `admin@empresa.com`
   - **Password:** `admin123`

### Opción 2: Pruebas en Consola del Navegador
```javascript
// Importar utilidades de prueba en la consola
import authTest from './src/utils/authTestUtils.js';

// Probar conexión directa con la API
await authTest.testApiConnection();

// Probar login completo
await authTest.testLogin();

// Verificar estado de autenticación
authTest.testAuthStatus();
```

### Opción 3: Verificación Manual con cURL
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "admin123"
  }'
```

## 🔧 Variables de Entorno

Archivo `.env`:
```properties
# API Configuration - Backend Spring Boot
VITE_API_URL=http://localhost:8080

# App Configuration  
VITE_APP_NAME="Sistema de Gestión Empresarial"
VITE_APP_VERSION=1.0.0
```

## 🚨 Resolución de Problemas

### Error 404 - Endpoint no encontrado
- ✅ Verifica que el backend esté ejecutándose
- ✅ Confirma que la ruta `/api/auth/login` existe
- ✅ Revisa los logs del servidor Spring Boot

### Error CORS
```javascript
// Si hay errores de CORS, agregar en el backend Spring Boot:
@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class AuthController {
    // ...
}
```

### Error de Conexión (Network Error)
- ✅ Verifica que el puerto 8080 esté abierto
- ✅ Confirma que no hay firewall bloqueando la conexión
- ✅ Revisa la URL en el archivo `.env`

### Error 401 - Credenciales incorrectas
- ✅ Verifica que las credenciales estén en la base de datos
- ✅ Confirma el formato de la request JSON
- ✅ Revisa la lógica de validación en el backend

## 📊 Logs de Debugging

La aplicación ahora incluye logs detallados en la consola:

```javascript
// Login exitoso
🔍 Probando conexión con API de autenticación...
📡 URL del API: http://localhost:8080
📤 Enviando credenciales: {email: "admin@empresa.com", password: "admin123"}
✅ Login exitoso: {token: "session-token-xxx", usuario: {...}}

// Error de conexión
❌ Error en el login: HTTP error! status: 404
🔧 Verificar:
   - ¿Está el backend ejecutándose en http://localhost:8080?
   - ¿El endpoint /api/auth/login está disponible?
   - ¿Las credenciales son correctas?
```

## 🎯 Próximos Pasos

1. **🔄 Logout**: Implementar endpoint `/api/auth/logout` si es necesario
2. **🔑 JWT**: Migrar a tokens JWT para mayor seguridad
3. **👥 Registro**: Implementar endpoint `/api/auth/register`
4. **🔐 Cambio de contraseña**: Endpoint `/api/auth/change-password`
5. **📱 Refresh token**: Para mantener sesiones activas

## 💡 Notas Técnicas

- **Token de sesión**: Se genera un token local ya que el backend no devuelve JWT
- **Persistencia**: Los datos se guardan en `localStorage`
- **Validación**: Se mantiene la validación del frontend
- **Seguridad**: Preparado para migrar a JWT cuando esté disponible

¡La aplicación ahora usa autenticación real! 🚀