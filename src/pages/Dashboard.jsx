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
import '../styles/Dashboard.css';

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
    <Card className="metric-card">
      <CardContent className="metric-card-content">
        <div className="metric-icon-wrapper">
          <div className="metric-icon">
            {icon}
          </div>
        </div>
        <Typography variant="h4" component="div" className="metric-value">
          {format === 'currency' ? formatCurrency(value) : formatNumber(value)}
        </Typography>
        <Typography variant="body2" className="metric-label">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <div className="dashboard-container">
      <Container maxWidth="xl" className="dashboard-content">
        <div className="dashboard-header">
          <Typography variant="h4" className="dashboard-title">
            Bienvenido, {user?.name}
          </Typography>
          
          <Typography variant="body1" className="dashboard-subtitle">
            Resumen de tu negocio
          </Typography>
        </div>

        {/* Métricas principales */}
        <Grid container spacing={3} className="metrics-grid">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Ventas del Mes"
              value={dashboardData.metrics.monthlySales || 0}
              icon={<TrendingUp />}
              color="success"
              format="currency"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Pedidos Pendientes"
              value={dashboardData.metrics.pendingOrders || 0}
              icon={<ShoppingCart />}
              color="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Clientes Activos"
              value={dashboardData.metrics.activeCustomers || 0}
              icon={<People />}
              color="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Productos en Stock"
              value={dashboardData.metrics.productsInStock || 0}
              icon={<Inventory />}
              color="primary"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} className="content-grid">
          {/* Pedidos recientes */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card className="content-card">
              <div className="content-card-header">
                <Typography variant="h6" className="content-card-title">
                  Pedidos Recientes
                </Typography>
                <Button size="small" href="/orders" className="nav-button">
                  Ver todos
                </Button>
              </div>
              <div className="content-card-body">
                {dashboardData.recentOrders.length > 0 ? (
                  <List className="dashboard-list">
                    {dashboardData.recentOrders.map((order) => (
                      <ListItem key={order.id} className="dashboard-list-item">
                        <ListItemIcon className="list-item-icon">
                          {order.estado === ORDER_STATUS.ENTREGADO ? (
                            <CheckCircle color="success" />
                          ) : order.estado === ORDER_STATUS.EN_PROCESO ? (
                            <LocalShipping color="info" />
                          ) : (
                            <Schedule color="warning" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography className="list-item-primary">
                              Pedido #{order.id}
                            </Typography>
                          }
                          secondary={
                            <Typography className="list-item-secondary">
                              Cliente: {order.clienteNombre || order.cliente?.nombre || 'Sin cliente'} • {getRelativeTime(order.fechaPedido)}
                            </Typography>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(order.total)}
                          </Typography>
                          <StatusChip status={order.estado} type="order" className="status-chip" />
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <div className="empty-state">
                    <Schedule className="empty-state-icon" />
                    <Typography variant="body2" className="empty-state-text">
                      No hay pedidos recientes
                    </Typography>
                  </div>
                )}
              </div>
            </Card>
          </Grid>

          {/* Panel lateral */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Notificaciones */}
            <Card className="content-card" sx={{ mb: 3 }}>
              <div className="content-card-header">
                <Typography variant="h6" className="content-card-title">
                  Notificaciones
                </Typography>
              </div>
              <div className="content-card-body">
                {dashboardData.notifications.length > 0 ? (
                  <List dense className="dashboard-list">
                    {dashboardData.notifications.map((notification) => (
                      <ListItem key={notification.id} className="dashboard-list-item">
                        <ListItemIcon className="list-item-icon">
                          {notification.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography className="list-item-primary">
                              {notification.title}
                            </Typography>
                          }
                          secondary={
                            <Typography className="list-item-secondary">
                              {notification.message}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <div className="empty-state">
                    <NotificationImportant className="empty-state-icon" />
                    <Typography variant="body2" className="empty-state-text">
                      No hay notificaciones nuevas
                    </Typography>
                  </div>
                )}
              </div>
            </Card>

            {/* Productos con stock bajo */}
            <Card className="content-card">
              <div className="content-card-header">
                <Typography variant="h6" className="content-card-title">
                  Stock Bajo
                </Typography>
                <Button size="small" href="/inventory" className="nav-button">
                  Ver inventario
                </Button>
              </div>
              <div className="content-card-body">
                {dashboardData.lowStockProducts.length > 0 ? (
                  <List dense className="dashboard-list">
                    {dashboardData.lowStockProducts.slice(0, 5).map((product) => (
                      <ListItem key={product.id} className="dashboard-list-item">
                        <ListItemText
                          primary={
                            <Typography className="list-item-primary">
                              {product.name}
                            </Typography>
                          }
                          secondary={
                            <Typography className="list-item-secondary">
                              Stock actual: {product.currentStock}
                            </Typography>
                          }
                        />
                        <Chip
                          label="Bajo"
                          size="small"
                          className="status-chip warning"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <div className="empty-state">
                    <Inventory className="empty-state-icon" />
                    <Typography variant="body2" className="empty-state-text">
                      Todos los productos tienen stock suficiente
                    </Typography>
                  </div>
                )}
              </div>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;