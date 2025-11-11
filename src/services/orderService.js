import apiService from './api';

class OrderService {
  // Crear pedido
  async createPedido(pedidoData) {
    try {
      console.log('🔄 Creando pedido con:', pedidoData);
      console.log('📦 Request body JSON:', JSON.stringify(pedidoData, null, 2));
      
      const response = await apiService.post('/pedidos', pedidoData);
      console.log('✅ Pedido creado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('🚫 Error detallado al crear pedido:', {
        message: error.message,
        pedidoData: pedidoData,
        timestamp: new Date().toISOString()
      });
      
      // Si el error es 400, podría ser un problema de validación
      if (error.message.includes('400')) {
        throw new Error(`Datos inválidos: ${error.message}. Verifica que el cliente, vendedor y productos sean válidos.`);
      }
      
      throw new Error('Error al crear pedido: ' + error.message);
    }
  }

  // Alias para mantener compatibilidad
  async createOrder(orderData) {
    return this.createPedido(orderData);
  }

  // Obtener todos los pedidos
  async getPedidos(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/pedidos?${queryParams}` : '/pedidos';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener pedidos: ' + error.message);
    }
  }

  // Obtener pedidos por estado
  async getPedidosByEstado(estado) {
    try {
      return await apiService.get(`/pedidos/estado/${estado}`);
    } catch (error) {
      throw new Error('Error al obtener pedidos por estado: ' + error.message);
    }
  }

  // Obtener pedidos por vendedor
  async getPedidosByVendedor(vendedorId) {
    try {
      return await apiService.get(`/pedidos/vendedor/${vendedorId}`);
    } catch (error) {
      throw new Error('Error al obtener pedidos del vendedor: ' + error.message);
    }
  }

  // Obtener pedidos por cliente
  async getPedidosByCliente(clienteId) {
    try {
      return await apiService.get(`/pedidos/cliente/${clienteId}`);
    } catch (error) {
      throw new Error('Error al obtener pedidos del cliente: ' + error.message);
    }
  }

  // Obtener pedido por ID
  async getPedidoById(id) {
    try {
      return await apiService.get(`/pedidos/${id}`);
    } catch (error) {
      throw new Error('Error al obtener pedido: ' + error.message);
    }
  }

  // Alias para mantener compatibilidad
  async getOrderById(id) {
    return this.getPedidoById(id);
  }

  // Actualizar pedido
  async updatePedido(id, pedidoData) {
    try {
      return await apiService.put(`/pedidos/${id}`, pedidoData);
    } catch (error) {
      throw new Error('Error al actualizar pedido: ' + error.message);
    }
  }

  // Actualizar estado del pedido
  async updateEstadoPedido(id, estadoData) {
    try {
      // El backend espera el estado como query parameter, no en el body
      const nuevoEstado = estadoData.estado || estadoData;
      console.log('� Actualizando estado de pedido:', id, 'a:', nuevoEstado);
      
      return await apiService.put(`/pedidos/${id}/estado?nuevoEstado=${nuevoEstado}`);
    } catch (error) {
      console.error('🚫 Error al actualizar estado:', error);
      throw new Error('Error al actualizar estado del pedido: ' + error.message);
    }
  }

  // Eliminar pedido
  async deletePedido(id) {
    try {
      return await apiService.delete(`/pedidos/${id}`);
    } catch (error) {
      throw new Error('Error al eliminar pedido: ' + error.message);
    }
  }

  // Métodos auxiliares para obtener datos relacionados
  
  // Obtener productos para el pedido
  async getProductosForOrder() {
    try {
      return await apiService.get('/productos/con-stock');
    } catch (error) {
      throw new Error('Error al obtener productos: ' + error.message);
    }
  }

  // Obtener vendedores disponibles
  async getVendedoresAvailable() {
    try {
      return await apiService.get('/vendedores/para-asignacion');
    } catch (error) {
      throw new Error('Error al obtener vendedores: ' + error.message);
    }
  }

  // Obtener clientes para asignación
  async getClientesAvailable() {
    try {
      return await apiService.get('/clientes/para-pedidos');
    } catch (error) {
      throw new Error('Error al obtener clientes: ' + error.message);
    }
  }

  // Reporte de pedidos
  async getPedidosReport(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reportes/pedidos?${queryParams}` : '/reportes/pedidos';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener reporte de pedidos: ' + error.message);
    }
  }

  // Reporte de ventas
  async getVentasReport(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reportes/ventas?${queryParams}` : '/reportes/ventas';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener reporte de ventas: ' + error.message);
    }
  }
}

export default new OrderService();