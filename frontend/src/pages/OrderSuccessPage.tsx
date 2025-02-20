import React, { useEffect } from 'react';
import { Typography, Paper, Box, Container, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { motion } from 'framer-motion';

const OrderSuccessPage: React.FC = () => {
  const clearCart = useCartStore((state) => state.clearCart);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id'); // Get session_id from URL

  // Clear the cart when the component mounts
  useEffect(() => {
    clearCart();
  }, [clearCart]);

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
            <CheckCircleOutlineIcon sx={{ fontSize: 70, color: 'success.main', mb: 2 }} />
          </motion.div>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Thank You For Your Order!
      </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your payment was successful and your order is being processed.
            You can view your order details in your account.
      </Typography>
      {sessionId && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 4 }}>
          Stripe Session ID: {sessionId}
        </Typography>
      )}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" component={RouterLink} to="/orders">
              View Order History
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

export default OrderSuccessPage; 