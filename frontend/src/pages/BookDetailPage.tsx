import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import axios from 'axios';
import { Book } from '../types'; // Re-use Book type if possible
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import MotionButton from '../components/MotionButton'; // Import MotionButton

interface AuthorDetails {
    name: string;
    bio?: string | { type: string; value: string };
    // Add other author fields
}

const BookDetailPage: React.FC = () => {
  const { olid } = useParams<{ olid: string }>(); // Get OLID from route params
  const [bookDetails, setBookDetails] = useState<Book | null>(null);
  const [authorDetails, setAuthorDetails] = useState<AuthorDetails | null>(null); // State for author details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addItem: addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlistStore();

  const bookIdForStores = `/works/${olid}`; // Construct ID matching how it's stored

  useEffect(() => {
    const fetchDetails = async () => {
      if (!olid) {
        setError('Book ID not found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch book details from OpenLibrary Works API
        const bookResponse = await axios.get(`https://openlibrary.org/works/${olid}.json`);
        const bookData = bookResponse.data;

        // Basic mapping (adjust as needed based on actual API response)
        const details: Book = {
            id: bookData.key, // Ensure this matches the format used elsewhere (/works/OL...)
            title: bookData.title,
            author: 'Fetching author...', // Placeholder
            authorId: bookData.authors?.[0]?.author?.key, // Get first author key
            publishedYear: bookData.first_publish_date ? parseInt(bookData.first_publish_date.split(' ').pop() || '0', 10) : undefined,
            imageUrl: `https://covers.openlibrary.org/b/id/${bookData.covers?.[0]}-L.jpg`, // Use large cover
            description: bookData.description,
            subjects: bookData.subjects?.slice(0, 10), // Limit subjects
            first_publish_date: bookData.first_publish_date,
            covers: bookData.covers, // Map covers array
            price: 10.99, // Assuming fixed price for now
        };
        setBookDetails(details);

        // Fetch author details if author key exists
        if (details.authorId) {
             try {
                 const authorResponse = await axios.get(`https://openlibrary.org${details.authorId}.json`);
                 const authorData = authorResponse.data;
                 setAuthorDetails({
                     name: authorData.name,
                     bio: authorData.bio,
                 });
                 // Update author name in book details
                 setBookDetails(prev => prev ? { ...prev, author: authorData.name } : null);
             } catch (authorErr) {
                 console.error("Error fetching author details:", authorErr);
                 // Update book details with fallback author name if fetch fails
                 setBookDetails(prev => prev ? { ...prev, author: 'Author details unavailable' } : null);
             }
         } else {
             setBookDetails(prev => prev ? { ...prev, author: 'Unknown Author' } : null);
         }

      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [olid]);

  const handleAddToCart = () => {
    if (bookDetails) {
        // Need to ensure the Book object passed matches the store expectations
        const bookForCart: Book = {
            ...bookDetails,
            // Ensure imageUrl uses medium cover for consistency in cart/wishlist
            imageUrl: `https://covers.openlibrary.org/b/id/${bookDetails.covers?.[0]}-M.jpg`,
        };
      addToCart(bookForCart, 1);
      // Optionally show a notification
    }
  };

  const handleToggleWishlist = () => {
    if (bookDetails) {
        const bookForWishlist: Book = {
            ...bookDetails,
            imageUrl: `https://covers.openlibrary.org/b/id/${bookDetails.covers?.[0]}-M.jpg`,
        };
      if (isWishlisted(bookIdForStores)) {
        removeFromWishlist(bookIdForStores);
      } else {
        addToWishlist(bookForWishlist);
      }
    }
  };

  // Helper to safely render description
  const renderDescription = (desc: Book['description']) => {
    if (!desc) return 'No description available.';
    if (typeof desc === 'string') return desc;
    if (typeof desc === 'object' && desc.value) return desc.value;
    return 'No description available.';
  };
  
  // Helper to render author bio
  const renderAuthorBio = (bio: AuthorDetails['bio']) => {
    if (!bio) return null;
    if (typeof bio === 'string') return bio;
    if (typeof bio === 'object' && bio.value) return bio.value;
    return null;
  };

  if (loading) {
    return <Container sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Container>;
  }

  if (error) {
    return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  if (!bookDetails) {
    return <Container sx={{ py: 4 }}><Alert severity="warning">Book details not found.</Alert></Container>;
  }

  const wishlisted = isWishlisted(bookIdForStores);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
          {/* Book Cover Column */}
          <Box sx={{ width: { xs: '100%', sm: '33.33%', md: '25%' }, flexShrink: 0 }}>
            <Box 
              component="img"
              src={bookDetails.imageUrl || 'https://via.placeholder.com/300x450?text=No+Image'}
              alt={`Cover of ${bookDetails.title}`}
              sx={{ width: '100%', height: 'auto', borderRadius: 1, objectFit: 'cover', display: 'block' }}
            />
          </Box>

          {/* Book Info Column */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              {bookDetails.title}
            </Typography>
            <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 2 }}>
              by {bookDetails.author || 'Unknown Author'}
              {bookDetails.publishedYear && ` (${bookDetails.publishedYear})`}
            </Typography>
            
             {/* Price */}
            <Typography variant="h5" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
              ${bookDetails.price.toFixed(2)}
            </Typography>
            
            {/* Actions: Add to Cart, Wishlist */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <MotionButton // Use MotionButton
                variant="contained" 
                startIcon={<AddShoppingCartIcon />}
                onClick={handleAddToCart}
                size="large"
              >
                Add to Cart
              </MotionButton>
              <MotionButton // Use MotionButton
                variant={wishlisted ? "outlined" : "outlined"} 
                startIcon={wishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                onClick={handleToggleWishlist}
                color={wishlisted ? "error" : "inherit"}
                size="large"
              >
                {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </MotionButton>
            </Box>

            {/* Description */}
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              {renderDescription(bookDetails.description)}
            </Typography>

            {/* Subjects/Genres */}
            {bookDetails.subjects && bookDetails.subjects.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Genres:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {bookDetails.subjects.map((subject) => (
                    <Chip key={subject} label={subject} size="small" />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Author Bio (Optional) */}
            {authorDetails && renderAuthorBio(authorDetails.bio) && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>About the Author ({authorDetails.name})</Typography>
                <Typography variant="body2">{renderAuthorBio(authorDetails.bio)}</Typography>
              </Box>
            )}

          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookDetailPage; 