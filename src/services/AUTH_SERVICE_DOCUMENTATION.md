# 🔐 Servicio de Autenticación - Documentación Completa

## 📋 Descripción General

El `authService.js` es un servicio completo que maneja toda la funcionalidad de autenticación de la aplicación. Ha sido completamente actualizado para integrarse perfectamente con los endpoints del backend Spring Boot.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas
- **Login/Logout** con manejo completo de sesiones
- **Registro de usuarios** con validación de roles
- **Gestión de roles y permisos** (ADMIN, VENDEDOR, CLIENTE)
- **Validación automática de sesiones** con expiración
- **Manejo de errores robusto** con mensajes específicos
- **Sistema de permisos granular** basado en roles
- **Verificación de conectividad** con el backend
- **Logging detallado** para debugging
- **Compatibilidad completa** con endpoints del API

## 🔧 API de Métodos

### Autenticación Básica

#### `login(credentials)`
```javascript
// Iniciar sesión
const result = await authService.login({
  email: 'admin@empresa.com',
  password: 'admin123'
});

console.log(result);
// {
//   success: true,
//   message: "Login exitoso",
//   usuario: { id: 1, nombre: "Admin Sistema", email: "admin@empresa.com", rol: "ADMIN" },
//   token: "session_1699567890123_abc123"
// }
```

#### `register(userData)`
```javascript
// Registrar nuevo usuario
const newUser = await authService.register({
  nombre: 'Juan Pérez',
  email: 'juan.perez@empresa.com',
  password: 'password123',
  rol: 'VENDEDOR'
});
```

#### `logout()`
```javascript
// Cerrar sesión
await authService.logout();
```

### Gestión de Sesiones

#### `isAuthenticated()`
```javascript
// Verificar si está autenticado
if (authService.isAuthenticated()) {
  console.log('Usuario autenticado');
} else {
  console.log('Usuario no autenticado');
}
```

#### `getUser()`
```javascript
// Obtener datos del usuario actual
const user = authService.getUser();
console.log(user);
// {
//   id: 1,
//   nombre: "Admin Sistema",
//   email: "admin@empresa.com",
//   rol: "ADMIN",
//   activo: true
// }
```

#### `getUserProfile()`
```javascript
// Obtener perfil completo
const profile = await authService.getUserProfile();
console.log(profile);
// {
//   id: 1,
//   nombre: "Admin Sistema",
//   email: "admin@empresa.com",
//   rol: "ADMIN",
//   activo: true,
//   isAuthenticated: true
// }
```

### Roles y Permisos

#### Verificación de Roles
```javascript
// Verificar roles específicos
const isAdmin = authService.isAdmin();
const isVendedor = authService.isVendedor();
const isCliente = authService.isCliente();

// Verificar rol específico
const hasRole = authService.hasRole('ADMIN');

// Obtener rol actual
const role = authService.getUserRole();
```

#### Sistema de Permisos
```javascript
// Obtener permisos del usuario actual
const permissions = authService.getPermissions();
console.log(permissions);
// {
//   canViewDashboard: true,
//   canManageUsers: true,
//   canManageClients: true,
//   canManageVendors: true,
//   canManageProducts: true,
//   canManageOrders: true,
//   canManageMeetings: true,
//   canViewReports: true,
//   canCreateOrders: true,
//   canScheduleMeetings: true
// }
```

### Utilidades del Sistema

#### `getRoles()`
```javascript
// Obtener roles disponibles del sistema
const roles = await authService.getRoles();
console.log(roles); // ['ADMIN', 'VENDEDOR', 'CLIENTE']
```

#### `getTestCredentials()`
```javascript
// Obtener credenciales de prueba para desarrollo
const testCreds = await authService.getTestCredentials();
console.log(testCreds);
// {
//   admin: {
//     email: "admin@empresa.com",
//     password: "admin123",
//     rol: "ADMIN"
//   }
// }
```

#### `checkConnection()`
```javascript
// Verificar conectividad con el backend
const connectionStatus = await authService.checkConnection();
console.log(connectionStatus);
// {
//   connected: true,
//   status: 'online',
//   message: 'Conexión establecida correctamente',
//   timestamp: '2025-11-09T22:00:00.000Z'
// }
```

#### `getSessionInfo()`
```javascript
// Obtener información completa de la sesión
const sessionInfo = authService.getSessionInfo();
console.log(sessionInfo);
// {
//   isAuthenticated: true,
//   sessionActive: true,
//   usuario: { id: 1, nombre: "Admin Sistema", ... },
//   loginTime: '2025-11-09T22:00:00.000Z',
//   sessionDuration: 45, // minutos
//   permissions: { canViewDashboard: true, ... }
// }
```

## 🔒 Sistema de Permisos por Rol

### ADMIN (Administrador)
```javascript
{
  canViewDashboard: true,
  canManageUsers: true,
  canManageClients: true,
  canManageVendors: true,
  canManageProducts: true,
  canManageOrders: true,
  canManageMeetings: true,
  canViewReports: true,
  canCreateOrders: true,
  canScheduleMeetings: true
}
```

### VENDEDOR
```javascript
{
  canViewDashboard: true,
  canManageUsers: false,
  canManageClients: true,
  canManageVendors: false,
  canManageProducts: false,
  canManageOrders: true,
  canManageMeetings: true,
  canViewReports: true,
  canCreateOrders: true,
  canScheduleMeetings: true
}
```

### CLIENTE
```javascript
{
  canViewDashboard: true,
  canManageUsers: false,
  canManageClients: false,
  canManageVendors: false,
  canManageProducts: false,
  canManageOrders: false,
  canManageMeetings: false,
  canViewReports: false,
  canCreateOrders: true,
  canScheduleMeetings: true
}
```

## 🛡️ Seguridad y Validación

### Expiración de Sesión
- **Duración**: 24 horas desde el login
- **Validación automática**: Se verifica en cada llamada a `isAuthenticated()`
- **Limpieza automática**: Los datos se eliminan si la sesión expira

### Manejo de Errores
```javascript
// Errores específicos por código HTTP
try {
  await authService.login({ email: 'invalid@test.com', password: 'wrong' });
} catch (error) {
  console.log(error.message);
  // Posibles mensajes:
  // - "Credenciales inválidas. Verifique su email y contraseña." (401)
  // - "Usuario no encontrado." (404)
  // - "Error del servidor. Intente nuevamente más tarde." (5xx)
}
```

### Almacenamiento Local
```javascript
// Estructura de datos en localStorage
{
  "authData": {
    "usuario": {
      "id": 1,
      "nombre": "Admin Sistema",
      "email": "admin@empresa.com",
      "rol": "ADMIN",
      "activo": true
    },
    "sessionToken": "session_1699567890123_abc123",
    "loginTime": "2025-11-09T22:00:00.000Z"
  }
}
```

## 🧪 Testing y Debugging

### Comandos de Prueba en Consola
```javascript
// Ejecutar en la consola del navegador

// 1. Verificar estado de autenticación
window.authTest = {
  // Verificar si está autenticado
  checkAuth: () => {
    console.log('Autenticado:', authService.isAuthenticated());
    console.log('Usuario:', authService.getUser());
    console.log('Rol:', authService.getUserRole());
  },

  // Probar login con credenciales de prueba
  testLogin: async () => {
    try {
      const result = await authService.login({
        email: 'admin@empresa.com',
        password: 'admin123'
      });
      console.log('✅ Login exitoso:', result);
    } catch (error) {
      console.error('❌ Error login:', error.message);
    }
  },

  // Verificar permisos
  checkPermissions: () => {
    const permissions = authService.getPermissions();
    console.log('Permisos:', permissions);
  },

  // Información de sesión
  sessionInfo: () => {
    const info = authService.getSessionInfo();
    console.log('Sesión:', info);
  },

  // Verificar conectividad
  testConnection: async () => {
    const status = await authService.checkConnection();
    console.log('Conexión:', status);
  },

  // Obtener credenciales de prueba
  getTestCreds: async () => {
    try {
      const creds = await authService.getTestCredentials();
      console.log('Credenciales de prueba:', creds);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
};

// Ejecutar pruebas
window.authTest.checkAuth();
window.authTest.testLogin();
window.authTest.checkPermissions();
```

## 🔄 Integración con Componentes

### Hook de Autenticación Recomendado
```javascript
// useAuth.js - Hook personalizado
import { useState, useEffect } from 'react';
import authService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await authService.validateToken();
        if (isValid) {
          const userData = authService.getUser();
          const userPermissions = authService.getPermissions();
          
          setUser(userData);
          setIsAuthenticated(true);
          setPermissions(userPermissions);
        }
      } catch (error) {
        console.error('Error validando autenticación:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    setUser(result.usuario);
    setIsAuthenticated(true);
    setPermissions(authService.getPermissions());
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setPermissions({});
  };

  return {
    user,
    isAuthenticated,
    permissions,
    loading,
    login,
    logout,
    isAdmin: authService.isAdmin(),
    isVendedor: authService.isVendedor(),
    isCliente: authService.isCliente()
  };
};
```

### Protección de Rutas
```javascript
// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.rol !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

## 📋 Notas de Implementación

### Características Técnicas
- **Sin tokens JWT**: El backend utiliza autenticación básica sin tokens
- **Sesión local**: Se genera un token de sesión local para manejo del frontend
- **Compatibilidad**: Mantiene compatibilidad con versiones anteriores
- **Logging detallado**: Incluye emojis y mensajes descriptivos para debugging
- **Manejo robusto de errores**: Diferentes tipos de error según el contexto
- **Validación automática**: Verifica sesión y limpia datos automáticamente

### Endpoints del Backend Utilizados
```
POST /api/auth/login          - Iniciar sesión
POST /api/auth/register       - Registrar usuario
GET  /api/auth/roles          - Obtener roles disponibles
GET  /api/auth/test-credentials - Obtener credenciales de prueba
```

### Próximas Mejoras Sugeridas
1. **Interceptores de Axios**: Para manejo automático de errores 401/403
2. **Refresh de sesión**: Renovación automática antes del vencimiento
3. **Múltiples sesiones**: Soporte para múltiples dispositivos
4. **Audit logging**: Registro de actividades de autenticación
5. **Two-factor authentication**: Implementación de 2FA

---

## 🚀 Cómo Usar

1. **Importar el servicio**:
   ```javascript
   import authService from './services/authService';
   ```

2. **Verificar autenticación**:
   ```javascript
   if (authService.isAuthenticated()) {
     // Usuario autenticado
   }
   ```

3. **Usar en componentes**:
   ```javascript
   const user = authService.getUser();
   const permissions = authService.getPermissions();
   ```

4. **Testing en consola**:
   ```javascript
   // Abrir DevTools y ejecutar
   window.authTest.testLogin();
   ```

¡El servicio de autenticación está completamente actualizado y listo para usar con todos los endpoints del backend! 🎉