import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Box,
  Container,
  Button,
  Typography
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const itemCount = useCartStore((state) => state.getItemCount());
  const wishlistItemCount = useWishlistStore((state) => state.items.length);
  const { isLoggedIn, logout } = useAuthStore();

  return (
    <AppBar 
      position="sticky"
      elevation={1}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <RouterLink to="/" style={{ display: 'flex', alignItems: 'center', marginRight: '16px', textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                component="span" 
                sx={{ 
                  fontSize: '1.8rem',
                  filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))'
                }}
              >
                📚
              </Typography>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontFamily: '"Pacifico", cursive',
                  fontWeight: 400,
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                  letterSpacing: '0.5px'
                }}
              >
                Shelf
              </Typography>
            </Box>
          </RouterLink>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="cart"
              component={RouterLink}
              to="/cart"
              title="Shopping Cart"
            >
              <motion.div
                key={itemCount}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
            >
              <Badge badgeContent={itemCount} color="secondary">
                <ShoppingCartIcon />
              </Badge>
              </motion.div>
            </IconButton>

            <IconButton
              color="inherit"
              aria-label="wishlist"
              component={RouterLink}
              to="/wishlist"
              title="My Wishlist"
            >
              <Badge badgeContent={wishlistItemCount} color="secondary">
                <FavoriteBorderIcon />
              </Badge>
            </IconButton>

            {isLoggedIn ? (
              <>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/orders"
                  startIcon={<AccountCircleIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  My Account
                </Button>
                <Button 
                  color="inherit" 
                  onClick={logout}
                  sx={{ textTransform: 'none' }}
                 >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/login"
                  startIcon={<LoginIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Login / Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 