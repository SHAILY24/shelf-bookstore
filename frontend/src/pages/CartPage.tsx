import React, { useState } from 'react';
import {
  Typography,
  List,
  ListItem,
  IconButton,
  Divider,
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Container,
  TextField,
  Link
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { useCartStore } from '../store/cartStore';
import { createCheckoutSession } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Link as RouterLink } from 'react-router-dom';
import MotionButton from '../components/MotionButton';

// Use empty string as default if key is missing - this will show a proper error message later
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CartPage: React.FC = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    getCartTotal,
    getItemCount,
  } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuantityChange = (id: string, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
        updateQuantity(id, newQuantity);
    } else if (event.target.value === '') {
        updateQuantity(id, 0);
    }
  };

  const handleCheckout = async () => {
    setError(null);
    setLoading(true);

    try {
      // Log for debugging
      console.log("Starting checkout process");
      console.log("Stripe key available:", !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      
      const itemsToCheckout = items.filter(item => item.quantity > 0);
      if (itemsToCheckout.length === 0) {
        setError('Cannot checkout with an empty cart or zero quantity items.');
        setLoading(false);
        return;
      }

      console.log("Creating checkout session...");
      const data = await createCheckoutSession(itemsToCheckout);
      console.log("Checkout session created:", data);
      
      const stripe = await stripePromise;
      console.log("Stripe initialized:", !!stripe);

      if (!stripe) {
        setError('Stripe initialization failed. Please check if the Stripe publishable key is configured correctly.');
        setLoading(false);
        return;
      }

      if (data.sessionId) {
        console.log("Redirecting to Stripe checkout...");
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });
        if (stripeError) {
          console.error("Stripe redirect error:", stripeError);
          setError(stripeError.message || 'Failed to redirect to Stripe.');
        }
      } else {
        setError('Failed to get checkout session ID.');
      }
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      let message = 'An unknown error occurred during checkout.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const total = getCartTotal();
  const itemCount = getItemCount();

  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: 'background.default' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Shopping Cart
      </Typography>

      {items.length === 0 ? (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
          <ProductionQuantityLimitsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Your cart is empty.
          </Typography>
          <Button variant="contained" component={RouterLink} to="/">
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: { md: 'flex' }, gap: { md: 4 } }}>
          <Box sx={{ flexGrow: 1, width: { xs: '100%', md: 'auto' } }}>
            <Paper variant="outlined" sx={{ mb: { xs: 3, md: 0 }, borderRadius: 2 }}>
              <List disablePadding>
                {items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ width: { xs: '20%', sm: '15%' }, display: 'flex', alignItems: 'center' }}>
                          <Box
                            component="img"
                            sx={{ width: '100%', height: 'auto', maxHeight: 90, objectFit: 'contain' }}
                            src={item.imageUrl || 'https://via.placeholder.com/80x100?text=No+Image'}
                            alt={item.title}
                          />
                        </Box>
                        <Box sx={{ width: { xs: '75%', sm: '45%', md: '50%' } }}>
                          <Typography variant="body1" component="div" fontWeight="medium" title={item.title} noWrap>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            by {item.author}
                          </Typography>
                          <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                            ${item.price.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ width: { xs: '50%', sm: '15%', md: '15%' }, display: 'flex', justifyContent: 'center', order: { xs: 3, sm: 0 } }}>
                          <TextField
                            type="number"
                            size="small"
                            label="Qty"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e)}
                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                            sx={{ width: '75px' }}
                          />
                        </Box>
                        <Box sx={{ width: { xs: '50%', sm: '20%', md: '15%' }, textAlign: 'right', order: { xs: 4, sm: 0 } }}>
                          <IconButton aria-label="delete" onClick={() => removeItem(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < items.length - 1 && <Divider component="li" variant="middle" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0 }}>
            <Paper variant="outlined" sx={{ p: 3, position: 'sticky', top: '80px', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal ({itemCount} items)</Typography>
                <Typography fontWeight="medium">${total.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'text.secondary' }}>
                <Typography variant="body2">Est. Shipping</Typography>
                <Typography variant="body2">Calculated at checkout</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">${total.toFixed(2)}</Typography>
              </Box>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              )}
              <MotionButton
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <ShoppingCartCheckoutIcon />}
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </MotionButton>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                Secure payment via <Link href="https://stripe.com" target="_blank" rel="noopener">Stripe</Link>.
              </Typography>
            </Paper>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default CartPage; 