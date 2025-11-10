// Debug utils para testing de APIs de pedidos
import clienteService from '../services/clienteService';
import vendedorService from '../services/vendedorService';
import productoService from '../services/productoService';
import orderService from '../services/orderService';

class PedidoTestUtils {
  // Probar conexión con clientes
  async testClientesConnection() {
    try {
      console.group('🧪 Testing Clientes API');
      console.log('📡 URL del API:', import.meta.env.VITE_API_URL || 'http://localhost:8080');
      
      console.log('📞 Llamando a /api/clientes/para-pedidos...');
      const clientes = await clienteService.getClientesParaPedidos();
      
      console.log('✅ Respuesta exitosa:', clientes);
      console.log('📊 Total de clientes:', clientes?.data?.length || clientes?.length || 0);
      
      if (clientes?.data?.length > 0 || clientes?.length > 0) {
        console.log('📋 Primer cliente:', clientes?.data?.[0] || clientes[0]);
      }
      
      console.groupEnd();
      return clientes;
    } catch (error) {
      console.group('❌ Error en Clientes API');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('URL intentada:', `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/clientes/para-pedidos`);
      console.groupEnd();
      throw error;
    }
  }

  // Probar conexión con vendedores
  async testVendedoresConnection() {
    try {
      console.group('🧪 Testing Vendedores API');
      console.log('📞 Llamando a /api/vendedores/para-asignacion...');
      
      const vendedores = await vendedorService.getVendedoresParaAsignacion();
      
      console.log('✅ Respuesta exitosa:', vendedores);
      console.log('📊 Total de vendedores:', vendedores?.data?.length || vendedores?.length || 0);
      
      if (vendedores?.data?.length > 0 || vendedores?.length > 0) {
        console.log('📋 Primer vendedor:', vendedores?.data?.[0] || vendedores[0]);
      }
      
      console.groupEnd();
      return vendedores;
    } catch (error) {
      console.group('❌ Error en Vendedores API');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('URL intentada:', `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/vendedores/para-asignacion`);
      console.groupEnd();
      throw error;
    }
  }

  // Probar conexión con productos
  async testProductosConnection() {
    try {
      console.group('🧪 Testing Productos API');
      console.log('📞 Llamando a /api/productos/con-stock...');
      
      const productos = await productoService.getProductosConStock();
      
      console.log('✅ Respuesta exitosa:', productos);
      console.log('📊 Total de productos:', productos?.data?.length || productos?.length || 0);
      
      if (productos?.data?.length > 0 || productos?.length > 0) {
        console.log('📋 Primer producto:', productos?.data?.[0] || productos[0]);
      }
      
      console.groupEnd();
      return productos;
    } catch (error) {
      console.group('❌ Error en Productos API');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('URL intentada:', `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/productos/con-stock`);
      console.groupEnd();
      throw error;
    }
  }

  // Probar creación de pedido
  async testCreatePedido() {
    try {
      console.group('🧪 Testing Create Pedido');
      
      // Datos de prueba
      const testPedido = {
        clienteId: 1,
        vendedorId: 1,
        notas: "Pedido de prueba desde frontend",
        detalles: [
          {
            productoId: 1,
            cantidad: 2,
            precioUnitario: 1299.99
          }
        ]
      };

      console.log('📤 Datos del pedido de prueba:', testPedido);
      console.log('📞 Llamando a POST /api/pedidos...');
      
      const response = await orderService.createOrder(testPedido);
      
      console.log('✅ Pedido creado exitosamente:', response);
      console.groupEnd();
      return response;
    } catch (error) {
      console.group('❌ Error al crear pedido');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('URL intentada:', `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/pedidos`);
      console.groupEnd();
      throw error;
    }
  }

  // Probar todas las conexiones
  async testAllConnections() {
    console.log('🚀 Iniciando pruebas completas de API de pedidos...');
    
    try {
      await this.testClientesConnection();
      await this.testVendedoresConnection();
      await this.testProductosConnection();
      
      console.log('✅ Todas las pruebas de APIs completadas exitosamente');
      console.log('💡 Tip: Para probar creación de pedido, ejecuta: pedidoTest.testCreatePedido()');
    } catch (error) {
      console.error('❌ Error en las pruebas de API:', error.message);
      console.log('🔧 Verificar:');
      console.log('   - ¿Está el backend ejecutándose en http://localhost:8080?');
      console.log('   - ¿Los endpoints están disponibles?');
      console.log('   - ¿Hay datos de clientes, vendedores y productos?');
    }
  }

  // Verificar configuración del entorno
  checkEnvironment() {
    console.group('🔍 Verificación del Entorno');
    console.log('🌐 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8080 (default)');
    console.log('🔑 Token de sesión:', localStorage.getItem('authToken') ? '✅ Presente' : '❌ Ausente');
    console.log('👤 Usuario logueado:', localStorage.getItem('user') ? '✅ Presente' : '❌ Ausente');
    
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('📋 Datos del usuario:', userData);
      } catch (e) {
        console.log('❌ Error parsing user data');
      }
    }
    console.groupEnd();
  }
}

// Crear instancia global para testing
const pedidoTestUtils = new PedidoTestUtils();

// Agregar al window para acceso desde consola
if (typeof window !== 'undefined') {
  window.pedidoTest = pedidoTestUtils;
}

export default pedidoTestUtils;