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
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import orderService from '../services/orderService';
import inventoryService from '../services/inventoryService';
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

const OrderManagement = () => {
  const { user } = useAuth();
  const { orders, loading: ordersLoading, updateOrderStatus, cancelOrder } = useOrders();
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
  const [newOrderData, setNewOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    products: [],
    notes: '',
  });
  
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    loadAvailableProducts();
  }, []);

  const loadAvailableProducts = async () => {
    try {
      const products = await inventoryService.getProducts();
      setAvailableProducts(products.data || products);
    } catch (error) {
      console.error('Error loading products:', error);
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
      if (status !== order.status) {
        statusOptions[status] = ORDER_STATUS_LABELS[status];
      }
    });

    const result = await showSelectDialog(
      'Cambiar estado del pedido',
      statusOptions,
      order.status
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

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        ...newOrderData,
        total: calculateOrderTotal(),
        status: ORDER_STATUS.PENDING,
      };

      await orderService.createOrder(orderData);
      showSuccess('Pedido creado', 'El pedido se ha creado exitosamente');
      setCreateOrderOpen(false);
      setNewOrderData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        products: [],
        notes: '',
      });
    } catch (error) {
      showError('Error', error.message);
    }
  };

  const calculateOrderTotal = () => {
    return newOrderData.products.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const addProductToOrder = (product) => {
    const existingItem = newOrderData.products.find(item => item.productId === product.id);
    
    if (existingItem) {
      setNewOrderData(prev => ({
        ...prev,
        products: prev.products.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      }));
    } else {
      setNewOrderData(prev => ({
        ...prev,
        products: [...prev.products, {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
        }],
      }));
    }
  };

  const removeProductFromOrder = (productId) => {
    setNewOrderData(prev => ({
      ...prev,
      products: prev.products.filter(item => item.productId !== productId),
    }));
  };

  const updateProductQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeProductFromOrder(productId);
      return;
    }

    setNewOrderData(prev => ({
      ...prev,
      products: prev.products.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      ),
    }));
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
      { status: ORDER_STATUS.PENDING, label: 'Pendiente' },
      { status: ORDER_STATUS.CONFIRMED, label: 'Confirmado' },
      { status: ORDER_STATUS.IN_PROCESS, label: 'En Proceso' },
      { status: ORDER_STATUS.READY, label: 'Listo' },
      { status: ORDER_STATUS.SHIPPED, label: 'Enviado' },
      { status: ORDER_STATUS.DELIVERED, label: 'Entregado' },
    ];
  };

  const getActiveStep = (currentStatus) => {
    const steps = getStatusSteps();
    return steps.findIndex(step => step.status === currentStatus);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm) ||
                         order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || order.status === filters.status;
    
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
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={3}>
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
                        #{order.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {order.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customerEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.createdAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getRelativeTime(order.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(order.total)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={order.status} type="order" />
                    </TableCell>
                    <TableCell>
                      {order.seller ? (
                        <Typography variant="body2">
                          {order.seller.name}
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
        {menuState.order?.status !== ORDER_STATUS.CANCELLED && (
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Estado del Pedido
                    </Typography>
                    <Stepper activeStep={getActiveStep(selectedOrder.status)} orientation="vertical">
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
              <Grid item xs={12}>
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
                <Grid item xs={12}>
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
      <Dialog
        open={createOrderOpen}
        onClose={() => setCreateOrderOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crear Nuevo Pedido</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Información del cliente */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nombre del cliente"
                value={newOrderData.customerName}
                onChange={(e) => setNewOrderData(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Email del cliente"
                type="email"
                value={newOrderData.customerEmail}
                onChange={(e) => setNewOrderData(prev => ({ ...prev, customerEmail: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Teléfono del cliente"
                value={newOrderData.customerPhone}
                onChange={(e) => setNewOrderData(prev => ({ ...prev, customerPhone: e.target.value }))}
              />
            </Grid>

            {/* Selección de productos */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Productos Disponibles
              </Typography>
              <Grid container spacing={2}>
                {availableProducts.slice(0, 6).map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" gutterBottom>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(product.price)}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => addProductToOrder(product)}
                          sx={{ mt: 1 }}
                        >
                          Agregar
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Productos seleccionados */}
            {newOrderData.products.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Productos Seleccionados
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="center">Cantidad</TableCell>
                      <TableCell align="right">Precio</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {newOrderData.products.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) => updateProductQuantity(
                              item.productId,
                              parseInt(e.target.value) || 0
                            )}
                            inputProps={{ min: 1 }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => removeProductFromOrder(item.productId)}
                            color="error"
                          >
                            <Cancel />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="h6">Total</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6">
                          {formatCurrency(calculateOrderTotal())}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            )}

            {/* Notas */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas (opcional)"
                multiline
                rows={3}
                value={newOrderData.notes}
                onChange={(e) => setNewOrderData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOrderOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateOrder}
            variant="contained"
            disabled={!newOrderData.customerName || !newOrderData.customerEmail || newOrderData.products.length === 0}
          >
            Crear Pedido
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderManagement;