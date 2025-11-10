# 🧪 Testing Rápido - Comandos de Consola

## 📋 Comandos para Consola del Navegador

### **1. Verificar Entorno**
```javascript
// Verificar configuración y autenticación
window.pedidoTest.checkEnvironment()
```

### **2. Probar Todas las Conexiones**
```javascript
// Test completo de todas las APIs
window.pedidoTest.testAllConnections()
```

### **3. Tests Individuales**
```javascript
// Solo clientes
window.pedidoTest.testClientesConnection()

// Solo vendedores  
window.pedidoTest.testVendedoresConnection()

// Solo productos
window.pedidoTest.testProductosConnection()
```

### **4. Crear Pedido de Prueba**
```javascript
// Test de creación de pedido
window.pedidoTest.testCreatePedido()
```

## 🔍 Logs de Ejemplo

### **✅ Respuesta Exitosa**
```
🧪 Testing Clientes API
📡 URL del API: http://localhost:8080
📞 Llamando a /api/clientes/para-pedidos...
✅ Respuesta exitosa: [{id: 1, nombre: "Cliente Test", email: "test@test.com"}]
📊 Total de clientes: 5
📋 Primer cliente: {id: 1, nombre: "Cliente Test", email: "test@test.com"}
```

### **❌ Error de Conexión**
```
❌ Error en Clientes API
Error details: TypeError: Failed to fetch
Error message: Failed to fetch
URL intentada: http://localhost:8080/api/clientes/para-pedidos
🔧 Verificar:
   - ¿Está el backend ejecutándose en http://localhost:8080?
   - ¿Los endpoints están disponibles?
   - ¿Hay datos de clientes, vendedores y productos?
```

## 🚨 Troubleshooting

### **Error 404 - Endpoint no encontrado**
```bash
# Verificar que estos endpoints existan en tu backend:
GET http://localhost:8080/api/clientes/para-pedidos
GET http://localhost:8080/api/vendedores/para-asignacion
GET http://localhost:8080/api/productos/con-stock
POST http://localhost:8080/api/pedidos
```

### **Error CORS**
```javascript
// Si aparece error CORS, agregar en el backend:
@CrossOrigin(origins = "http://localhost:5173")
```

### **Error 401 - No autorizado**
```javascript
// Verificar autenticación
window.pedidoTest.checkEnvironment()
// Debe mostrar: 🔑 Token de sesión: ✅ Presente
```

### **Datos vacíos**
```javascript
// Si los arrays están vacíos, verificar que haya datos en BD:
📊 Total de clientes: 0  // ← Problema en BD
📊 Total de vendedores: 0  // ← Problema en BD
📊 Total de productos: 0  // ← Problema en BD
```

## 🎯 Flujo de Testing Recomendado

1. **Verificar entorno**
   ```javascript
   window.pedidoTest.checkEnvironment()
   ```

2. **Test conexiones**
   ```javascript
   window.pedidoTest.testAllConnections()
   ```

3. **Si todo está OK, test crear pedido**
   ```javascript
   window.pedidoTest.testCreatePedido()
   ```

4. **Usar interfaz real**
   - Ir a "Gestión de Pedidos"
   - Clic en "Nuevo Pedido"
   - Verificar que cargan los dropdowns
   - Crear un pedido real

## 📱 Testing en Interfaz

### **Checklist de UI**
- [ ] Se abre el formulario de pedidos
- [ ] Se cargan los clientes en el dropdown
- [ ] Se cargan los vendedores en el dropdown
- [ ] Se cargan los productos con stock
- [ ] Se puede seleccionar cliente
- [ ] Se muestran datos del cliente seleccionado
- [ ] Se pueden agregar productos
- [ ] Se calcula el total correctamente
- [ ] Se puede crear el pedido
- [ ] Aparece mensaje de éxito
- [ ] Se cierra el formulario

¡Con estos comandos puedes debuggear cualquier problema! 🛠️