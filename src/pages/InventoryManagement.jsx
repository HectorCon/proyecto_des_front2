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
  Avatar,
  Badge,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Search,
  Inventory2,
  Warning,
  TrendingUp,
  TrendingDown,
  AddCircle,
  RemoveCircle,
  MoreVert,
  Category,
  QrCode,
  AttachMoney,
} from '@mui/icons-material';
import inventoryService from '../services/inventoryService';
import { 
  showSuccess, 
  showError, 
  showDeleteConfirm 
} from '../utils/alerts';
import { 
  PRODUCT_CATEGORIES, 
  PRODUCT_CATEGORY_LABELS,
  PAGINATION,
  ERROR_MESSAGES 
} from '../utils/constants';
import { formatCurrency, formatNumber, debounce } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION.DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    lowStock: false,
  });

  // Estados para diálogos
  const [productDialog, setProductDialog] = useState({
    open: false,
    mode: 'create',
    product: null,
  });

  const [stockDialog, setStockDialog] = useState({
    open: false,
    product: null,
    type: 'entry', // 'entry' | 'exit'
  });

  const [menuState, setMenuState] = useState({
    anchorEl: null,
    product: null,
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    sku: '',
    barcode: '',
    minStock: '',
    currentStock: '',
  });

  const [stockMovement, setStockMovement] = useState({
    quantity: '',
    reason: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [page, rowsPerPage, searchTerm, filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        ...filters,
      };

      const response = await inventoryService.getProducts(params);
      setProducts(response.data || response);
      setTotal(response.total || response.length);
    } catch (error) {
      showError('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await inventoryService.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleOpenProductDialog = (mode, product = null) => {
    setProductDialog({ open: true, mode, product });
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        cost: product.cost?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        minStock: product.minStock?.toString() || '',
        currentStock: product.currentStock?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        cost: '',
        sku: '',
        barcode: '',
        minStock: '',
        currentStock: '',
      });
    }
    setFormErrors({});
  };

  const handleCloseProductDialog = () => {
    setProductDialog({ open: false, mode: 'create', product: null });
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      cost: '',
      sku: '',
      barcode: '',
      minStock: '',
      currentStock: '',
    });
    setFormErrors({});
  };

  const handleOpenStockDialog = (product, type) => {
    setStockDialog({ open: true, product, type });
    setStockMovement({
      quantity: '',
      reason: '',
      notes: '',
    });
  };

  const handleCloseStockDialog = () => {
    setStockDialog({ open: false, product: null, type: 'entry' });
    setStockMovement({
      quantity: '',
      reason: '',
      notes: '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleStockMovementChange = (e) => {
    const { name, value } = e.target;
    setStockMovement(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = ERROR_MESSAGES.REQUIRED_FIELD;
    }

    if (!formData.price || isNaN(parseFloat(formData.price))) {
      errors.price = ERROR_MESSAGES.INVALID_NUMBER;
    }

    if (!formData.cost || isNaN(parseFloat(formData.cost))) {
      errors.cost = ERROR_MESSAGES.INVALID_NUMBER;
    }

    if (!formData.minStock || isNaN(parseInt(formData.minStock))) {
      errors.minStock = ERROR_MESSAGES.INVALID_NUMBER;
    }

    if (productDialog.mode === 'create' && (!formData.currentStock || isNaN(parseInt(formData.currentStock)))) {
      errors.currentStock = ERROR_MESSAGES.INVALID_NUMBER;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        sku: formData.sku,
        barcode: formData.barcode,
        minStock: parseInt(formData.minStock),
        ...(productDialog.mode === 'create' && { currentStock: parseInt(formData.currentStock) }),
      };

      if (productDialog.mode === 'create') {
        await inventoryService.createProduct(productData);
        showSuccess('Producto creado', 'El producto se ha creado exitosamente');
      } else {
        await inventoryService.updateProduct(productDialog.product.id, productData);
        showSuccess('Producto actualizado', 'El producto se ha actualizado exitosamente');
      }

      handleCloseProductDialog();
      loadProducts();
    } catch (error) {
      showError('Error', error.message);
    }
  };

  const handleDeleteProduct = async (product) => {
    const result = await showDeleteConfirm(
      '¿Eliminar producto?',
      `¿Estás seguro de que deseas eliminar "${product.name}"? Esta acción no se puede deshacer.`
    );

    if (result.isConfirmed) {
      try {
        await inventoryService.deleteProduct(product.id);
        showSuccess('Producto eliminado', 'El producto se ha eliminado exitosamente');
        loadProducts();
      } catch (error) {
        showError('Error', error.message);
      }
    }
  };

  const handleStockMovement = async () => {
    try {
      const movementData = {
        productId: stockDialog.product.id,
        quantity: parseInt(stockMovement.quantity),
        type: stockDialog.type,
        reason: stockMovement.reason,
        notes: stockMovement.notes,
      };

      if (stockDialog.type === 'entry') {
        await inventoryService.recordStockEntry(movementData);
        showSuccess('Entrada registrada', 'La entrada de stock se ha registrado exitosamente');
      } else {
        await inventoryService.recordStockExit(movementData);
        showSuccess('Salida registrada', 'La salida de stock se ha registrada exitosamente');
      }

      handleCloseStockDialog();
      loadProducts();
    } catch (error) {
      showError('Error', error.message);
    }
  };

  const handleMenuOpen = (event, product) => {
    setMenuState({
      anchorEl: event.currentTarget,
      product,
    });
  };

  const handleMenuClose = () => {
    setMenuState({
      anchorEl: null,
      product: null,
    });
  };

  const getStockStatus = (product) => {
    if (product.currentStock <= 0) {
      return { label: 'Sin stock', color: 'error', icon: <Warning /> };
    } else if (product.currentStock <= product.minStock) {
      return { label: 'Stock bajo', color: 'warning', icon: <Warning /> };
    } else {
      return { label: 'En stock', color: 'success', icon: null };
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Inventario
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra productos y controla el stock
        </Typography>
      </Box>

      {/* Resumen de inventario */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                  <Inventory2 />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {formatNumber(products.length)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Productos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {formatNumber(products.filter(p => p.currentStock <= p.minStock).length)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stock Bajo
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {formatCurrency(products.reduce((total, p) => total + (p.price * p.currentStock), 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valor Inventario
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                  <Category />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {formatNumber(categories.length)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Categorías
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controles de búsqueda y filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar productos..."
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
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filters.category}
                label="Categoría"
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {Object.values(PRODUCT_CATEGORIES).map(category => (
                  <MenuItem key={category} value={category}>
                    {PRODUCT_CATEGORY_LABELS[category]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant={filters.lowStock ? 'contained' : 'outlined'}
              startIcon={<Warning />}
              onClick={() => setFilters(prev => ({ ...prev, lowStock: !prev.lowStock }))}
              color={filters.lowStock ? 'warning' : 'primary'}
            >
              Solo Stock Bajo
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de productos */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>SKU/Código</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <LoadingSpinner loading={true} />
                  </TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{product.sku}</Typography>
                          {product.barcode && (
                            <Typography variant="caption" color="text.secondary">
                              {product.barcode}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={PRODUCT_CATEGORY_LABELS[product.category] || product.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(product.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Badge
                          badgeContent={product.currentStock <= product.minStock ? '!' : 0}
                          color="warning"
                        >
                          <Typography variant="body2" fontWeight="medium">
                            {formatNumber(product.currentStock)}
                          </Typography>
                        </Badge>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Mín: {product.minStock}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stockStatus.label}
                          color={stockStatus.color}
                          size="small"
                          icon={stockStatus.icon}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenStockDialog(product, 'entry')}
                          color="success"
                        >
                          <AddCircle />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenStockDialog(product, 'exit')}
                          color="error"
                        >
                          <RemoveCircle />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, product)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron productos
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
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

      {/* FAB para agregar producto */}
      <Fab
        color="primary"
        aria-label="agregar producto"
        onClick={() => handleOpenProductDialog('create')}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <Add />
      </Fab>

      {/* Menú de acciones */}
      <Menu
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            handleOpenProductDialog('edit', menuState.product);
            handleMenuClose();
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleDeleteProduct(menuState.product);
            handleMenuClose();
          }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear/editar producto */}
      <Dialog
        open={productDialog.open}
        onClose={handleCloseProductDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {productDialog.mode === 'create' ? 'Crear Producto' : 'Editar Producto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del producto"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Categoría"
                  onChange={handleFormChange}
                >
                  {Object.values(PRODUCT_CATEGORIES).map(category => (
                    <MenuItem key={category} value={category}>
                      {PRODUCT_CATEGORY_LABELS[category]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleFormChange}
                InputProps={{
                  startAdornment: <QrCode sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código de barras"
                name="barcode"
                value={formData.barcode}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio de venta"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                error={!!formErrors.price}
                helperText={formErrors.price}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Costo"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleFormChange}
                error={!!formErrors.cost}
                helperText={formErrors.cost}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stock mínimo"
                name="minStock"
                type="number"
                value={formData.minStock}
                onChange={handleFormChange}
                error={!!formErrors.minStock}
                helperText={formErrors.minStock}
              />
            </Grid>

            {productDialog.mode === 'create' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Stock inicial"
                  name="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={handleFormChange}
                  error={!!formErrors.currentStock}
                  helperText={formErrors.currentStock}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog}>
            Cancelar
          </Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {productDialog.mode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para movimientos de stock */}
      <Dialog
        open={stockDialog.open}
        onClose={handleCloseStockDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {stockDialog.type === 'entry' ? 'Entrada de Stock' : 'Salida de Stock'} - {stockDialog.product?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cantidad"
                name="quantity"
                type="number"
                value={stockMovement.quantity}
                onChange={handleStockMovementChange}
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivo"
                name="reason"
                value={stockMovement.reason}
                onChange={handleStockMovementChange}
                placeholder={stockDialog.type === 'entry' ? 'Ej: Compra, Devolución' : 'Ej: Venta, Daño, Pérdida'}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas adicionales"
                name="notes"
                multiline
                rows={3}
                value={stockMovement.notes}
                onChange={handleStockMovementChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStockDialog}>
            Cancelar
          </Button>
          <Button 
            onClick={handleStockMovement} 
            variant="contained"
            color={stockDialog.type === 'entry' ? 'success' : 'error'}
            disabled={!stockMovement.quantity || !stockMovement.reason}
          >
            {stockDialog.type === 'entry' ? 'Registrar Entrada' : 'Registrar Salida'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InventoryManagement;