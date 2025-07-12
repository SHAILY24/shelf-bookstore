import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  useTheme
} from '@mui/material';
import { useWishlistStore } from '../store/wishlistStore';
import BookCard from '../components/BookCard';

const WishlistPage: React.FC = () => {
  const wishlistItems = useWishlistStore((state) => state.items);
  const theme = useTheme();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        My Wishlist
      </Typography>

      {wishlistItems.length === 0 ? (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="body1">
            Your wishlist is empty. Add some books!
          </Typography>
        </Paper>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: theme.spacing(3)
        }}>
          {wishlistItems.map((book) => (
            // Not using motion here for simplicity, can be added
            <Box key={book.id} sx={{ height: '100%' }}>
              <BookCard book={book} />
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default WishlistPage; 