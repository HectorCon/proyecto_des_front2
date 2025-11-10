/**
 * Script de prueba para verificar la conexión con la API de autenticación
 * 
 * Para probar:
 * 1. Asegúrate de que el backend de Spring Boot esté ejecutándose en http://localhost:8080
 * 2. Usa las credenciales proporcionadas:
 *    - email: admin@empresa.com  
 *    - password: admin123
 * 3. Abre la consola del navegador para ver los logs
 */

import authService from '../services/authService';

// Función de prueba para el login
export const testLogin = async () => {
  try {
    console.log('🔍 Probando conexión con API de autenticación...');
    console.log('📡 URL del API:', import.meta.env.VITE_API_URL || 'http://localhost:8080');
    
    const credentials = {
      email: 'admin@empresa.com',
      password: 'admin123'
    };
    
    console.log('📤 Enviando credenciales:', credentials);
    
    const response = await authService.login(credentials);
    
    console.log('✅ Login exitoso:', response);
    console.log('👤 Usuario autenticado:', response.usuario);
    
    return response;
    
  } catch (error) {
    console.error('❌ Error en el login:', error.message);
    console.error('📋 Detalles del error:', error);
    
    // Información para debugging
    console.log('🔧 Verificar:');
    console.log('   - ¿Está el backend ejecutándose en http://localhost:8080?');
    console.log('   - ¿El endpoint /api/auth/login está disponible?');
    console.log('   - ¿Las credenciales son correctas?');
    
    throw error;
  }
};

// Función de prueba para verificar el estado de autenticación
export const testAuthStatus = () => {
  try {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getUser();
    const token = authService.getToken();
    
    console.log('🔐 Estado de autenticación:');
    console.log('   - Autenticado:', isAuthenticated);
    console.log('   - Usuario:', user);
    console.log('   - Token:', token ? '***Token presente***' : 'No hay token');
    
    return { isAuthenticated, user, hasToken: !!token };
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
    return { isAuthenticated: false, user: null, hasToken: false };
  }
};

// Función para limpiar la sesión
export const testLogout = () => {
  try {
    authService.logout();
    console.log('✅ Logout exitoso');
    return true;
  } catch (error) {
    console.error('❌ Error en logout:', error);
    return false;
  }
};

// Función para probar la respuesta de la API manualmente
export const testApiConnection = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const endpoint = `${apiUrl}/api/auth/login`;
    
    console.log('🌐 Probando conexión directa con:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@empresa.com',
        password: 'admin123'
      }),
    });
    
    console.log('📡 Status de respuesta:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 Datos recibidos:', data);
    
    return data;
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('🚫 Posibles causas:');
      console.log('   - El servidor no está ejecutándose');
      console.log('   - Problemas de CORS');
      console.log('   - URL incorrecta');
    }
    
    throw error;
  }
};

// Exportar todas las funciones de prueba
export default {
  testLogin,
  testAuthStatus,
  testLogout,
  testApiConnection,
};