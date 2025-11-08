import apiService from './api';

class AuthService {
  // Login de usuario
  async login(credentials) {
    try {
      // Comentado temporalmente - usar solo simulación
      /*
      // Usar el endpoint de autenticación real de Spring Boot
      const response = await apiService.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      // Si la respuesta es exitosa, procesar los datos
      if (response) {
        // Estructura de respuesta sin JWT - generar token de sesión simple
        const authResponse = {
          token: 'session-token-' + Date.now(),
          usuario: response.usuario || response.user || response || {
            id: response.id,
            nombre: response.nombre || response.name,
            email: response.email || credentials.email,
            role: response.role || response.rol || 'USER',
            activo: response.activo !== false
          }
        };
        
        this.setAuthData(authResponse.token, authResponse.usuario);
        return authResponse;
      } else {
        throw new Error('Respuesta de autenticación inválida');
      }
      */
      
      // Usar directamente simulación por ahora
      console.warn('Usando simulación de autenticación');
      return this.mockLogin(credentials);
      
    } catch (error) {
      // Si hay error 404 o el endpoint no existe, usar simulación
      if (error.message.includes('404') || error.message.includes('HTTP error! status: 404')) {
        console.warn('Endpoint de autenticación no disponible, usando simulación');
        return this.mockLogin(credentials);
      } else {
        // Si es otro tipo de error (401, 403, etc.), propagarlo
        throw new Error('Error de autenticación: ' + error.message);
      }
    }
  }

  // Validación simple de contraseña para desarrollo
  validatePassword(password) {
    // Para desarrollo, aceptar passwords simples
    return password === '123456' || password === 'admin' || password === 'password' || password === 'admin123';
  }

  // Simulación de login para desarrollo
  mockLogin(credentials) {
    // Validar credenciales básicas
    if (credentials.email === 'admin@empresa.com' && credentials.password === 'admin123') {
      const mockResponse = {
        token: 'mock-token-' + Date.now(),
        usuario: {
          id: 1,
          nombre: 'Administrador',
          email: credentials.email,
          role: 'ADMIN',
          activo: true
        }
      };
      
      this.setAuthData(mockResponse.token, mockResponse.usuario);
      return mockResponse;
    } else if (credentials.email === 'vendedor@empresa.com' && credentials.password === 'admin123') {
      const mockResponse = {
        token: 'mock-token-' + Date.now(),
        usuario: {
          id: 2,
          nombre: 'Vendedor Demo',
          email: credentials.email,
          role: 'VENDEDOR',
          activo: true
        }
      };
      
      this.setAuthData(mockResponse.token, mockResponse.usuario);
      return mockResponse;
    } else if (credentials.email === 'cliente@empresa.com' && credentials.password === 'admin123') {
      const mockResponse = {
        token: 'mock-token-' + Date.now(),
        usuario: {
          id: 3,
          nombre: 'Cliente Demo',
          email: credentials.email,
          role: 'CLIENTE',
          activo: true
        }
      };
      
      this.setAuthData(mockResponse.token, mockResponse.usuario);
      return mockResponse;
    } else {
      throw new Error('Credenciales inválidas');
    }
  }

  // Registro de usuario
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw new Error('Error en el registro: ' + error.message);
    }
  }

  // Logout
  async logout() {
    try {
      // Solo limpiar datos locales - no hay endpoint de logout en el backend
      console.log('Cerrando sesión...');
      this.clearAuthData();
    } catch (error) {
      console.error('Error durante logout:', error);
      // Asegurar que los datos se limpien incluso si hay error
      this.clearAuthData();
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Obtener datos del usuario del localStorage
  getUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Obtener perfil del usuario actual
  async getUserProfile() {
    try {
      const user = this.getUser();
      if (user) {
        // Devolver directamente los datos del usuario almacenados localmente
        // Sin hacer llamadas adicionales al backend
        return user;
      } else {
        throw new Error('Usuario no encontrado en sesión');
      }
    } catch (error) {
      throw new Error('Error al obtener perfil de usuario: ' + error.message);
    }
  }

  // Verificar validez del token
  async validateToken() {
    try {
      if (!this.isAuthenticated()) {
        return false;
      }

      // Simplemente verificar que tenemos datos de usuario válidos
      // Sin hacer llamadas adicionales al backend
      const user = this.getUser();
      return !!(user && user.id && user.email);
    } catch (error) {
      // Token inválido, limpiar datos
      this.clearAuthData();
      return false;
    }
  }

  // Cambiar contraseña
  async changePassword(oldPassword, newPassword) {
    try {
      const response = await apiService.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      return response;
    } catch (error) {
      throw new Error('Error al cambiar contraseña: ' + error.message);
    }
  }

  // Solicitar restablecimiento de contraseña
  async requestPasswordReset(email) {
    try {
      const response = await apiService.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw new Error('Error al solicitar restablecimiento: ' + error.message);
    }
  }

  // Restablecer contraseña con token
  async resetPassword(token, newPassword) {
    try {
      const response = await apiService.post('/auth/reset-password', {
        token,
        newPassword
      });
      return response;
    } catch (error) {
      throw new Error('Error al restablecer contraseña: ' + error.message);
    }
  }

  // Métodos auxiliares privados
  setAuthData(token, user) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Obtener rol del usuario actual
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }

  // Verificar si el usuario tiene un rol específico
  hasRole(role) {
    return this.getUserRole() === role;
  }

  // Verificar si el usuario tiene permisos de administrador
  isAdmin() {
    return this.hasRole('ADMIN');
  }

  // Verificar si el usuario es vendedor
  isVendedor() {
    return this.hasRole('VENDEDOR');
  }

  // Verificar si el usuario es cliente
  isCliente() {
    return this.hasRole('CLIENTE');
  }
}

export default new AuthService();