// Configuración base para las llamadas a la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Log completo del request
    console.log('🌐 Request details:', {
      method: config.method || 'GET',
      url: url,
      headers: config.headers,
      body: config.body ? JSON.parse(config.body) : null
    });

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Intentar obtener el mensaje de error del servidor
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;
        
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response headers:', Array.from(response.headers.entries()));
        
        try {
          const contentType = response.headers.get('content-type');
          console.log('🔍 Content-Type:', contentType);
          
          // Intentar leer como texto primero
          const responseText = await response.text();
          console.log('🔍 Response text:', responseText);
          
          if (contentType && contentType.includes('application/json') && responseText) {
            try {
              errorDetails = JSON.parse(responseText);
              console.error('❌ Server error response:', errorDetails);
              console.error('📋 Full error JSON:', JSON.stringify(errorDetails, null, 2));
              
              // Extraer mensaje de error de diferentes formatos
              if (errorDetails.message) {
                errorMessage = errorDetails.message;
              } else if (errorDetails.error) {
                errorMessage = errorDetails.error;
              } else if (errorDetails.detail) {
                errorMessage = errorDetails.detail;
              } else if (errorDetails.errors && Array.isArray(errorDetails.errors)) {
                errorMessage = errorDetails.errors.join(', ');
              } else if (typeof errorDetails === 'string') {
                errorMessage = errorDetails;
              }
            } catch (jsonError) {
              console.error('🔍 JSON parse error:', jsonError);
              errorMessage = responseText || errorMessage;
            }
          } else if (responseText) {
            errorMessage = responseText;
            console.error('❌ Server text error:', responseText);
          }
        } catch (parseError) {
          console.error('🔍 Could not parse error response:', parseError);
        }
        
        const error = new Error(errorMessage);
        error.details = errorDetails;
        error.status = response.status;
        throw error;
      }
      
      // Verificar si hay contenido antes de parsear JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        return text ? JSON.parse(text) : {};
      } else {
        // Si no es JSON, devolver texto plano o respuesta vacía
        return await response.text() || { success: true };
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Métodos HTTP básicos
  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }
}

export default new ApiService();