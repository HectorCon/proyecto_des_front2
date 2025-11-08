import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Phone,
  Email,
  LocationOn,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Business,
  ShoppingCart,
  People,
  Schedule,
  Star,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import businessService from '../services/businessService';
import { showSuccess, showError } from '../utils/alerts';
import { APP_CONFIG, SOCIAL_LINKS } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import Footer from '../components/layout/Footer';

const WebsitePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para diálogos
  const [contactDialog, setContactDialog] = useState(false);
  const [quoteDialog, setQuoteDialog] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  // Estados para formularios
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    description: '',
    budget: '',
  });

  useEffect(() => {
    loadWebsiteData();
  }, []);

  const loadWebsiteData = async () => {
    setLoading(true);
    try {
      const productsData = await businessService.getPublicCatalog();

      setFeaturedProducts(productsData.slice(0, 6));
    } catch (error) {
      console.error('Error loading website data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async () => {
    try {
      await businessService.sendContactInquiry(contactForm);
      showSuccess('Mensaje enviado', 'Nos contactaremos contigo pronto');
      setContactDialog(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      showError('Error', 'No se pudo enviar el mensaje');
    }
  };

  const handleQuoteRequest = async () => {
    try {
      await businessService.requestQuote(quoteForm);
      showSuccess('Cotización solicitada', 'Te enviaremos una cotización en breve');
      setQuoteDialog(false);
      setQuoteForm({ name: '', email: '', phone: '', businessType: '', description: '', budget: '' });
    } catch (error) {
      showError('Error', 'No se pudo enviar la solicitud');
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuAnchor(null);
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="fixed" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {APP_CONFIG.COMPANY}
          </Typography>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" onClick={() => scrollToSection('inicio')}>
                Inicio
              </Button>
              <Button color="inherit" onClick={() => scrollToSection('servicios')}>
                Servicios
              </Button>
              <Button color="inherit" onClick={() => scrollToSection('productos')}>
                Productos
              </Button>
              <Button color="inherit" onClick={() => scrollToSection('contacto')}>
                Contacto
              </Button>
              <Button 
                component={RouterLink} 
                to="/login" 
                variant="outlined" 
                color="inherit"
                sx={{ ml: 2 }}
              >
                Iniciar Sesión
              </Button>
            </Box>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={() => setMobileMenuAnchor(null)}
      >
        <MenuItem onClick={() => scrollToSection('inicio')}>Inicio</MenuItem>
        <MenuItem onClick={() => scrollToSection('servicios')}>Servicios</MenuItem>
        <MenuItem onClick={() => scrollToSection('productos')}>Productos</MenuItem>
        <MenuItem onClick={() => scrollToSection('contacto')}>Contacto</MenuItem>
        <Divider />
        <MenuItem component={RouterLink} to="/login">Iniciar Sesión</MenuItem>
      </Menu>

      {/* Hero Section */}
      <Box
        id="inicio"
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          pt: { xs: 12, md: 16 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Gestiona tu Negocio de Manera Inteligente
              </Typography>
              <Typography variant="h5" paragraph sx={{ opacity: 0.9 }}>
                Plataforma integral para administrar ventas, inventario, clientes y reportes. 
                Todo lo que necesitas para hacer crecer tu empresa.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 4 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                  onClick={() => setQuoteDialog(true)}
                >
                  Solicitar Cotización
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  sx={{ borderColor: 'white', color: 'white' }}
                  onClick={() => scrollToSection('servicios')}
                >
                  Conocer Más
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  height: 400,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" sx={{ opacity: 0.7 }}>
                  [Imagen del Dashboard]
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box id="servicios" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Nuestros Servicios
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Soluciones integrales para cada tipo de negocio
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                title: 'Gestión de Ventas',
                description: 'Control completo de pedidos, clientes y vendedores',
                icon: <ShoppingCart />,
              },
              {
                title: 'Control de Inventario',
                description: 'Administración eficiente de productos y stock',
                icon: <Business />,
              },
              {
                title: 'Gestión de Usuarios',
                description: 'Administración de roles y permisos de empleados',
                icon: <People />,
              },
            ].map((service, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {service.icon}
                      </Avatar>
                      <Typography variant="h5" component="h3">
                        {service.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => setContactDialog(true)}>
                      Más información
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Products Section */}
      <Box id="productos" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Productos Destacados
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Descubre nuestra selección de productos y servicios
          </Typography>

          <Grid container spacing={4}>
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                  <Card>
                    <CardMedia
                      sx={{ height: 200, bgcolor: 'grey.200' }}
                      title={product.name}
                    />
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {product.description}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(product.price)}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => setContactDialog(true)}>
                        Consultar
                      </Button>
                      <Button size="small" onClick={() => setQuoteDialog(true)}>
                        Cotizar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              // Productos de ejemplo si no hay datos del backend
              Array.from({ length: 6 }).map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Card>
                    <CardMedia
                      sx={{ height: 200, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Producto"
                    >
                      <Typography variant="body2" color="text.secondary">
                        Imagen del Producto
                      </Typography>
                    </CardMedia>
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        Producto {index + 1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Descripción del producto o servicio ofrecido.
                      </Typography>
                      <Typography variant="h6" color="primary">
                        Desde $999
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => setContactDialog(true)}>
                        Consultar
                      </Button>
                      <Button size="small" onClick={() => setQuoteDialog(true)}>
                        Cotizar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box id="contacto" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'primary.dark', color: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Contáctanos
          </Typography>
          <Typography variant="h6" align="center" paragraph sx={{ mb: 6, opacity: 0.9 }}>
            Estamos aquí para ayudarte a hacer crecer tu negocio
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Phone sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Teléfono"
                      secondary={APP_CONFIG.PHONE}
                      sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Email sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={APP_CONFIG.CONTACT_EMAIL}
                      sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <LocationOn sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Ubicación"
                      secondary="Ciudad de México, México"
                      sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                    />
                  </ListItem>
                </List>

                <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                  <IconButton 
                    href={SOCIAL_LINKS.FACEBOOK} 
                    target="_blank"
                    sx={{ color: 'white' }}
                  >
                    <Facebook />
                  </IconButton>
                  <IconButton 
                    href={SOCIAL_LINKS.TWITTER} 
                    target="_blank"
                    sx={{ color: 'white' }}
                  >
                    <Twitter />
                  </IconButton>
                  <IconButton 
                    href={SOCIAL_LINKS.INSTAGRAM} 
                    target="_blank"
                    sx={{ color: 'white' }}
                  >
                    <Instagram />
                  </IconButton>
                  <IconButton 
                    href={SOCIAL_LINKS.LINKEDIN} 
                    target="_blank"
                    sx={{ color: 'white' }}
                  >
                    <LinkedIn />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<Email />}
                  onClick={() => setContactDialog(true)}
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                >
                  Enviar Mensaje
                </Button>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<Schedule />}
                  onClick={() => setQuoteDialog(true)}
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                >
                  Solicitar Cotización
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  startIcon={<Phone />}
                  sx={{ borderColor: 'white', color: 'white' }}
                  href={`tel:${APP_CONFIG.PHONE}`}
                >
                  Llamar Ahora
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Dialog */}
      <Dialog open={contactDialog} onClose={() => setContactDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Envíanos un Mensaje</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Mensaje"
                multiline
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialog(false)}>Cancelar</Button>
          <Button onClick={handleContactSubmit} variant="contained">Enviar</Button>
        </DialogActions>
      </Dialog>

      {/* Quote Dialog */}
      <Dialog open={quoteDialog} onClose={() => setQuoteDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Solicitar Cotización</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={quoteForm.name}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={quoteForm.email}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={quoteForm.phone}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Tipo de negocio"
                value={quoteForm.businessType}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, businessType: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Descripción del proyecto"
                multiline
                rows={4}
                value={quoteForm.description}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Presupuesto estimado"
                value={quoteForm.budget}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, budget: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuoteDialog(false)}>Cancelar</Button>
          <Button onClick={handleQuoteRequest} variant="contained">Solicitar Cotización</Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default WebsitePage;