import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Box,
  Tooltip,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
// import StarIcon from '@mui/icons-material/Star'; // No rating from Open Library search
import { Book } from '../types';
import { Link as RouterLink } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import MotionButton from './MotionButton';

interface BookCardProps {
  book: Book; // Expecting Book from Open Library
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlistStore();
  const theme = useTheme();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleAddToCart = () => {
    // Price is added in the store, just pass the book object
    addItem(book, 1); 
    setNotificationMessage(`${book.title} added to cart!`);
    setShowNotification(true);
  };

  const handleToggleWishlist = () => {
    if (isWishlisted(book.id)) {
      removeFromWishlist(book.id);
      setNotificationMessage(`${book.title} removed from wishlist!`);
    } else {
      addToWishlist(book);
      setNotificationMessage(`${book.title} added to wishlist!`);
    }
    setShowNotification(true);
  };

  const handleCloseNotification = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowNotification(false);
  };

  const authorText = book.author || 'Unknown Author';
  const bookPrice = 10.99; // Default price for all books

  return (
    <motion.div
      style={{ height: '100%' }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      whileFocus={{ 
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '2px' 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Card sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ position: 'relative' }}>
          <RouterLink to={`/book/${book.id.split('/').pop()}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <CardMedia
              component="img"
              sx={{
                // Enforce aspect ratio, let height be determined by width
                aspectRatio: '2 / 3',
                width: '100%', 
                objectFit: 'cover',
                // Add a subtle background color for images that might not load or fit perfectly
                bgcolor: 'grey.200'
              }}
              image={book.imageUrl} // This URL includes the placeholder logic
              alt={book.title || 'Book cover'}
            />
          </RouterLink>
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Tooltip title={isWishlisted(book.id) ? "Remove from Wishlist" : "Add to Wishlist"}>
              <IconButton 
                size="small" 
                onClick={handleToggleWishlist}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                }}
              >
                {isWishlisted(book.id) ? 
                  <FavoriteIcon color="error" fontSize="small" /> : 
                  <FavoriteBorderIcon color="action" fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <RouterLink to={`/book/${book.id.split('/').pop()}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1, padding: theme.spacing(2) }}>
          <CardContent sx={{ p: 0, flexGrow: 1, overflow: 'hidden' }}>
            <Tooltip title={book.title || 'Untitled'} placement="top" enterDelay={500}>
              <Typography gutterBottom variant="h6" component="div" sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                mb: 0.5,
                lineHeight: 1.3,
                height: '2.6em' 
              }}>
                {book.title || 'Untitled'}
              </Typography>
            </Tooltip>
            <Tooltip title={authorText} placement="top" enterDelay={500}>
              <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                by {authorText}
              </Typography>
            </Tooltip>
            
            {/* Display the price */}
            <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              ${bookPrice.toFixed(2)}
            </Typography>
          </CardContent>
        </RouterLink>
        <CardActions sx={{ p: 2, pt: 0, mt: 'auto' }}>
          <MotionButton
            variant="contained" 
            size="small" 
            startIcon={<AddShoppingCartIcon />}
            onClick={handleAddToCart}
            fullWidth
          >
            Add to Cart
          </MotionButton>
        </CardActions>
      </Card>
      
      {/* Notification for adding to cart */}
      <Snackbar 
        open={showNotification} 
        autoHideDuration={3000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
          {notificationMessage}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default BookCard; 