import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { APP_CONFIG, SOCIAL_LINKS } from '../../utils/constants';
import '../../styles/Footer.css';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Información de la empresa */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom>
              {APP_CONFIG.COMPANY}
            </Typography>
            <Typography variant="body2" paragraph>
              Sistema integral de gestión empresarial que te ayuda a
              administrar tus negocios de manera eficiente y profesional.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Email sx={{ mr: 1, fontSize: 18 }} />
              <Typography variant="body2">
                {APP_CONFIG.CONTACT_EMAIL}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone sx={{ mr: 1, fontSize: 18 }} />
              <Typography variant="body2">
                {APP_CONFIG.PHONE}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 1, fontSize: 18 }} />
              <Typography variant="body2">
                Ciudad de México, México
              </Typography>
            </Box>
          </Grid>

          {/* Enlaces útiles */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom>
              Enlaces Útiles
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link href="/about" color="inherit" sx={{ mb: 1 }}>
                Acerca de Nosotros
              </Link>
              <Link href="/services" color="inherit" sx={{ mb: 1 }}>
                Nuestros Servicios
              </Link>
              <Link href="/contact" color="inherit" sx={{ mb: 1 }}>
                Contacto
              </Link>
              <Link href="/support" color="inherit" sx={{ mb: 1 }}>
                Soporte Técnico
              </Link>
              <Link href="/privacy" color="inherit" sx={{ mb: 1 }}>
                Política de Privacidad
              </Link>
              <Link href="/terms" color="inherit">
                Términos y Condiciones
              </Link>
            </Box>
          </Grid>

          {/* Redes sociales */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom>
              Síguenos
            </Typography>
            <Typography variant="body2" paragraph>
              Mantente conectado con nosotros en nuestras redes sociales
              para recibir las últimas noticias y actualizaciones.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <IconButton
                component="a"
                href={SOCIAL_LINKS.FACEBOOK}
                target="_blank"
                rel="noopener"
                sx={{ color: 'white', '&:hover': { color: '#1877f2' } }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                component="a"
                href={SOCIAL_LINKS.TWITTER}
                target="_blank"
                rel="noopener"
                sx={{ color: 'white', '&:hover': { color: '#1da1f2' } }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                component="a"
                href={SOCIAL_LINKS.INSTAGRAM}
                target="_blank"
                rel="noopener"
                sx={{ color: 'white', '&:hover': { color: '#e4405f' } }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                component="a"
                href={SOCIAL_LINKS.LINKEDIN}
                target="_blank"
                rel="noopener"
                sx={{ color: 'white', '&:hover': { color: '#0077b5' } }}
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                component="a"
                href={SOCIAL_LINKS.YOUTUBE}
                target="_blank"
                rel="noopener"
                sx={{ color: 'white', '&:hover': { color: '#ff0000' } }}
              >
                <YouTube />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} {APP_CONFIG.COMPANY}. 
            Todos los derechos reservados.
          </Typography>
          <Typography variant="body2">
            Versión {APP_CONFIG.VERSION}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;