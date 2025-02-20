import React from 'react';
import { Typography, Paper, Button, Box, Container } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const OrderCancelPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2, textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
          >
            <CancelOutlinedIcon sx={{ fontSize: 70, color: 'error.main', mb: 2 }} />
          </motion.div>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Order Cancelled
      </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Your order was cancelled or the payment session expired.
            Your cart has not been modified.
      </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" component={RouterLink} to="/cart">
              Return to Cart
      </Button>
      <Button variant="outlined" component={RouterLink} to="/">
        Continue Shopping
      </Button>
          </Box>
    </Paper>
      </motion.div>
    </Container>
  );
};

export default OrderCancelPage; 