import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Menu,
  Fab,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Visibility,
  Edit,
  Cancel,
  MoreVert,
  Add,
  Search,
  FilterList,
  ShoppingCart,
  Person,
  LocalShipping,
  Check,
  Schedule,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import orderService from '../services/orderService';
import { 
  showSuccess, 
  showError, 
  showDeleteConfirm,
  showSelectDialog 
} from '../utils/alerts';
import { 
  ORDER_STATUS, 
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAGINATION 
} from '../utils/constants';
import { formatDate, formatCurrency, getRelativeTime } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusChip from '../components/common/StatusChip';
import PedidoFormDialog from '../components/PedidoFormDialog';
import '../styles/OrderManagement.css';

// Import test utils for debugging in development
import pedidoTestUtils from '../utils/pedidoTestUtils';

const OrderManagement = () => {
  const { user } = useAuth();
  const { orders, loading: ordersLoading, updateOrderStatus, cancelOrder, loadUserOrders } = useOrders();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION.DEFAULT_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [menuState, setMenuState] = useState({
    anchorEl: null,
    order: null,
  });

  // Estados para nuevo pedido
  const [createOrderLoading, setCreateOrderLoading] = useState(false);

  // Debugging utilities - solo en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 OrderManagement - Estado actual:', {
        user: user,
        orders: orders,
        ordersCount: orders?.length || 0,
        ordersLoading: ordersLoading
      });
    }
  }, [user, orders, ordersLoading]);

  // Función para recargar pedidos manualmente
  const handleRefreshOrders = async () => {
    try {
      console.log('🔄 Recargando pedidos manualmente...');
      await loadUserOrders();
      console.log('✅ Pedidos recargados exitosamente');
    } catch (error) {
      console.error('❌ Error recargando pedidos:', error);
    }
  };

  const handleViewOrderDetails = async (order) => {
    setLoading(true);
    try {
      const orderDetails = await orderService.getOrderById(order.id);
      setSelectedOrder(orderDetails);
      setOrderDetailsOpen(true);
    } catch (error) {
      showError('Error', 'No se pudieron cargar los detalles del pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeOrderStatus = async (order) => {
    const statusOptions = {};
    Object.keys(ORDER_STATUS).forEach(key => {
      const status = ORDER_STATUS[key];
      if (status !== order.estado) {
        statusOptions[status] = ORDER_STATUS_LABELS[status];
      }
    });

    const result = await showSelectDialog(
      'Cambiar estado del pedido',
      statusOptions,
      order.estado
    );

    if (result.isConfirmed) {
      try {
        await updateOrderStatus(order.id, result.value);
        showSuccess('Estado actualizado', 'El estado del pedido se ha actualizado exitosamente');
      } catch (error) {
        showError('Error', error.message);
      }
    }
  };

  const handleCancelOrder = async (order) => {
    const result = await showDeleteConfirm(
      '¿Cancelar pedido?',
      `¿Estás seguro de que deseas cancelar el pedido #${order.id}?`
    );

    if (result.isConfirmed) {
      try {
        await cancelOrder(order.id, 'Cancelado por el administrador');
        showSuccess('Pedido cancelado', 'El pedido se ha cancelado exitosamente');
      } catch (error) {
        showError('Error', error.message);
      }
    }
  };

  const handleCreateOrder = async (pedidoData) => {
    setCreateOrderLoading(true);
    try {
      console.log('🔍 Creando pedido con datos:', pedidoData);
      
      // Validar datos antes de enviar
      if (!pedidoData.clienteId) {
        throw new Error('Cliente es requerido');
      }
      
      if (!pedidoData.detalles || pedidoData.detalles.length === 0) {
        throw new Error('Debe agregar al menos un producto');
      }

      const response = await orderService.createOrder(pedidoData);
      console.log('✅ Pedido creado exitosamente:', response);
      
      showSuccess('Pedido creado', 'El pedido se ha creado exitosamente');
      setCreateOrderOpen(false);
      
      // Recargar pedidos del contexto
      try {
        await loadUserOrders();
        console.log('✅ Lista de pedidos actualizada');
      } catch (reloadError) {
        console.error('⚠️ Error recargando lista de pedidos:', reloadError);
        // Fallback: recargar página completa
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // Mostrar el error específico del servidor
      const errorMessage = error.message || 'No se pudo crear el pedido';
      showError('Error al crear pedido', errorMessage);
    } finally {
      setCreateOrderLoading(false);
    }
  };



  const handleMenuOpen = (event, order) => {
    setMenuState({
      anchorEl: event.currentTarget,
      order,
    });
  };

  const handleMenuClose = () => {
    setMenuState({
      anchorEl: null,
      order: null,
    });
  };

  const getStatusSteps = () => {
    return [
      { status: ORDER_STATUS.PENDIENTE, label: 'Pendiente' },
      { status: ORDER_STATUS.EN_PROCESO, label: 'En Proceso' },
      { status: ORDER_STATUS.ENTREGADO, label: 'Entregado' },
    ];
  };

  const getActiveStep = (currentStatus) => {
    const steps = getStatusSteps();
    return steps.findIndex(step => step.status === currentStatus);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm) ||
                         order.numeroPedido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || order.estado === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Pedidos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra y da seguimiento a los pedidos
        </Typography>
      </Box>

      {/* Controles de búsqueda y filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Buscar por ID o nombre de cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.status}
                label="Estado"
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                {Object.values(ORDER_STATUS).map(status => (
                  <MenuItem key={status} value={status}>
                    {ORDER_STATUS_LABELS[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefreshOrders}
              disabled={ordersLoading}
              sx={{ height: 56 }}
            >
              {ordersLoading ? 'Cargando...' : 'Recargar'}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateOrderOpen(true)}
              sx={{ height: 56 }}
            >
              Nuevo Pedido
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de pedidos */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Pedido</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Vendedor</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordersLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <LoadingSpinner loading={true} />
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {order.numeroPedido || `#${order.id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {order.clienteNombre || order.cliente?.nombre || 'Cliente no asignado'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.clienteEmail || order.cliente?.email || 'Email no disponible'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.fechaPedido)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getRelativeTime(order.fechaPedido)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(order.total)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={order.estado} type="order" />
                    </TableCell>
                    <TableCell>
                      {order.vendedorNombre || order.vendedor?.nombre ? (
                        <Typography variant="body2">
                          {order.vendedorNombre || order.vendedor.nombre}
                        </Typography>
                      ) : (
                        <Chip label="Sin asignar" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewOrderDetails(order)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, order)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron pedidos
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredOrders.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={PAGINATION.PAGE_SIZE_OPTIONS}
          labelRowsPerPage="Filas por página"
        />
      </Paper>

      {/* Menú de acciones */}
      <Menu
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            handleChangeOrderStatus(menuState.order);
            handleMenuClose();
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Cambiar Estado
        </MenuItem>
        {menuState.order?.estado !== ORDER_STATUS.CANCELADO && (
          <MenuItem 
            onClick={() => {
              handleCancelOrder(menuState.order);
              handleMenuClose();
            }}
          >
            <Cancel fontSize="small" sx={{ mr: 1 }} />
            Cancelar Pedido
          </MenuItem>
        )}
      </Menu>

      {/* Dialog de detalles del pedido */}
      <Dialog
        open={orderDetailsOpen}
        onClose={() => setOrderDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles del Pedido #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3}>
              {/* Información del cliente */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Información del Cliente
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Nombre"
                          secondary={selectedOrder.customerName}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Email"
                          secondary={selectedOrder.customerEmail}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Teléfono"
                          secondary={selectedOrder.customerPhone || 'No proporcionado'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Estado del pedido */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Estado del Pedido
                    </Typography>
                    <Stepper activeStep={getActiveStep(selectedOrder.estado)} orientation="vertical">
                      {getStatusSteps().map((step, index) => (
                        <Step key={step.status}>
                          <StepLabel>
                            {step.label}
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </CardContent>
                </Card>
              </Grid>

              {/* Productos */}
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Productos
                    </Typography>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Producto</TableCell>
                          <TableCell align="center">Cantidad</TableCell>
                          <TableCell align="right">Precio Unit.</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.products?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography variant="h6">Total</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="h6">
                              {formatCurrency(selectedOrder.total)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notas */}
              {selectedOrder.notes && (
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Notas
                      </Typography>
                      <Typography variant="body2">
                        {selectedOrder.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDetailsOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear nuevo pedido */}
      <PedidoFormDialog
        open={createOrderOpen}
        onClose={() => setCreateOrderOpen(false)}
        onSubmit={handleCreateOrder}
        loading={createOrderLoading}
      />
    </Container>
  );
};

export default OrderManagement;
