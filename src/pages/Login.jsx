import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import {
  Login as LoginIcon,
  Person,
  Lock,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showError } from '../utils/alerts';
import { APP_CONFIG, ERROR_MESSAGES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }
    
    if (!formData.password) {
      errors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password.length < 6) {
      errors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      showError('Error de autenticación', error.message);
    }
  };

  if (loading) {
    return <LoadingSpinner loading={true} message="Iniciando sesión..." backdrop={true} />;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo y título */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <LoginIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography component="h1" variant="h4" color="primary">
              {APP_CONFIG.SHORT_NAME}
            </Typography>
          </Box>
          
          <Typography component="h2" variant="h5" gutterBottom>
            Iniciar Sesión
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" paragraph>
            Accede a tu cuenta para gestionar tu negocio
          </Typography>

          {/* Error global */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <Person sx={{ color: 'action.active', mr: 1 }} />
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                startAdornment: (
                  <Lock sx={{ color: 'action.active', mr: 1 }} />
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              Iniciar Sesión
            </Button>
            
            <Grid container>
              <Grid size={{ xs: true }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  ¿Olvidaste tu contraseña?
                </Link>
              </Grid>
              <Grid>
                <Link component={RouterLink} to="/register" variant="body2">
                  ¿No tienes cuenta? Regístrate
                </Link>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ width: '100%', my: 3 }} />
          
          {/* Enlaces adicionales */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ¿Eres cliente? Visita nuestro sitio web
            </Typography>
            <Button
              component={RouterLink}
              to="/website"
              variant="outlined"
              size="small"
            >
              Ir al Sitio Web
            </Button>
          </Box>
        </Paper>
        
        {/* Footer */}
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          © {new Date().getFullYear()} {APP_CONFIG.COMPANY}. Todos los derechos reservados.
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;