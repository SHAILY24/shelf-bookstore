import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
      <ErrorOutlineIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h4" component="h1" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Oops! The page you are looking for does not exist or may have been moved.
      </Typography>
      <Button variant="contained" component={RouterLink} to="/">
        Go Back Home
      </Button>
    </Container>
  );
};

export default NotFoundPage; 