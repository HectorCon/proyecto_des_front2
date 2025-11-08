import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  People,
  Inventory,
  Assessment,
  NotificationImportant,
  CheckCircle,
  Schedule,
  LocalShipping,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import reportService from '../services/reportService';
import inventoryService from '../services/inventoryService';
import { formatCurrency, formatNumber, getRelativeTime } from '../utils/helpers';
import { ORDER_STATUS } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusChip from '../components/common/StatusChip';

const Dashboard = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    metrics: {},
    lowStockProducts: [],
    recentOrders: [],
    notifications: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsResponse, lowStockResponse] = await Promise.all([
        reportService.getDashboardMetrics(),
        inventoryService.getLowStockProducts(10),
      ]);

      setDashboardData({
        metrics: metricsResponse,
        lowStockProducts: lowStockResponse,
        recentOrders: orders.slice(0, 5),
        notifications: generateNotifications(lowStockResponse),
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (lowStockProducts) => {
    const notifications = [];
    
    if (lowStockProducts.length > 0) {
      notifications.push({
        id: 1,
        type: 'warning',
        title: 'Stock bajo',
        message: `${lowStockProducts.length} productos con stock bajo`,
        icon: <NotificationImportant color="warning" />,
        time: new Date(),
      });
    }

    return notifications;
  };

  if (loading) {
    return <LoadingSpinner loading={true} message="Cargando dashboard..." />;
  }

  const MetricCard = ({ title, value, icon, color = 'primary', format = 'number' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {format === 'currency' ? formatCurrency(value) : formatNumber(value)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Bienvenido, {user?.name}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Resumen de tu negocio
      </Typography>

      {/* Métricas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Ventas del Mes"
            value={dashboardData.metrics.monthlySales || 0}
            icon={<TrendingUp />}
            color="success"
            format="currency"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pedidos Pendientes"
            value={dashboardData.metrics.pendingOrders || 0}
            icon={<ShoppingCart />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Clientes Activos"
            value={dashboardData.metrics.activeCustomers || 0}
            icon={<People />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Productos en Stock"
            value={dashboardData.metrics.productsInStock || 0}
            icon={<Inventory />}
            color="primary"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Pedidos recientes */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Pedidos Recientes
              </Typography>
              <Button size="small" href="/orders">
                Ver todos
              </Button>
            </Box>
            {dashboardData.recentOrders.length > 0 ? (
              <List>
                {dashboardData.recentOrders.map((order) => (
                  <ListItem key={order.id} divider>
                    <ListItemIcon>
                      {order.status === ORDER_STATUS.DELIVERED ? (
                        <CheckCircle color="success" />
                      ) : order.status === ORDER_STATUS.SHIPPED ? (
                        <LocalShipping color="info" />
                      ) : (
                        <Schedule color="warning" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={`Pedido #${order.id}`}
                      secondary={`Cliente: ${order.customerName} • ${getRelativeTime(order.createdAt)}`}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(order.total)}
                      </Typography>
                      <StatusChip status={order.status} type="order" />
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No hay pedidos recientes
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Panel lateral */}
        <Grid item xs={12} md={4}>
          {/* Notificaciones */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notificaciones
            </Typography>
            {dashboardData.notifications.length > 0 ? (
              <List dense>
                {dashboardData.notifications.map((notification) => (
                  <ListItem key={notification.id} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {notification.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={notification.message}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay notificaciones nuevas
              </Typography>
            )}
          </Paper>

          {/* Productos con stock bajo */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Stock Bajo
              </Typography>
              <Button size="small" href="/inventory">
                Ver inventario
              </Button>
            </Box>
            {dashboardData.lowStockProducts.length > 0 ? (
              <List dense>
                {dashboardData.lowStockProducts.slice(0, 5).map((product) => (
                  <ListItem key={product.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={product.name}
                      secondary={`Stock actual: ${product.currentStock}`}
                    />
                    <Chip
                      label="Bajo"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Todos los productos tienen stock suficiente
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;