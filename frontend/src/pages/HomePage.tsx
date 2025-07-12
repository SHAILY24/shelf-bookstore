import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  TextField,
  Pagination,
  Container,
  InputAdornment,
  useTheme,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import BookCard from '../components/BookCard';
import { searchBooks, SearchBooksParams, SearchBooksResponse } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const BOOKS_PER_PAGE = 15;

const bookCategories = [
    "All", "Fiction", "Sci-Fi", "Fantasy", "Mystery", "Thriller", "Classic", "Dystopian", "Non-Fiction", "Biography", "History", "Science"
];

type SortOption = 'relevance' | 'title_asc' | 'title_desc' | 'year_asc' | 'year_desc';

const HomePage: React.FC = () => {
  const [booksResponse, setBooksResponse] = useState<SearchBooksResponse>({ books: [], totalResults: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const debouncedSearchTerm = useDebounce(searchTerm, 600);
  const theme = useTheme();

  const fetchAndSetBooks = useCallback(async (mounted: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = debouncedSearchTerm;
      if (selectedCategory !== 'All') {
        query = query ? `${query} subject:"${selectedCategory}"` : `subject:"${selectedCategory}"`;
      }
      if (!query) {
          query = 'popular books'; 
      }

      const params: SearchBooksParams = {
        page: currentPage,
        limit: BOOKS_PER_PAGE,
        query: query,
      };
      const data = await searchBooks(params);
      if (mounted) {
        setBooksResponse(data);
        const estimatedTotalPages = Math.ceil(data.totalResults / BOOKS_PER_PAGE);
        if (currentPage > estimatedTotalPages && estimatedTotalPages > 0) {
          setCurrentPage(estimatedTotalPages);
        }
      }
    } catch (err) {
      if (mounted) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred fetching books');
        setBooksResponse({ books: [], totalResults: 0 });
      }
    } finally {
      if (mounted) {
        setIsLoading(false);
      }
    }
  }, [debouncedSearchTerm, currentPage, selectedCategory]);

  useEffect(() => {
    let isMounted = true;
    fetchAndSetBooks(isMounted);
    return () => { isMounted = false; };
  }, [fetchAndSetBooks]);

  useEffect(() => {
    if (!isLoading) {
        setCurrentPage(1);
    }
  }, [debouncedSearchTerm, sortBy, selectedCategory]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
    setCurrentPage(1);
  };

  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    setSortBy(event.target.value as SortOption);
  };

  const sortedBooks = useMemo(() => {
    const booksToSort = [...booksResponse.books];
    switch (sortBy) {
      case 'title_asc':
        booksToSort.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        booksToSort.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'year_asc':
        booksToSort.sort((a, b) => (a.publishedYear || Infinity) - (b.publishedYear || Infinity));
        break;
      case 'year_desc':
        booksToSort.sort((a, b) => (b.publishedYear || -Infinity) - (a.publishedYear || -Infinity));
        break;
      case 'relevance':
      default:
        break;
    }
    return booksToSort;
  }, [booksResponse.books, sortBy]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const totalPages = Math.ceil(booksResponse.totalResults / BOOKS_PER_PAGE);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 128px)' }}>
      <Box sx={{
          py: { xs: 6, md: 8 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
          color: 'primary.contrastText'
      }}>
          <Container maxWidth="md">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Welcome to Shelf
                </Typography>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <Typography variant="h6" component="p" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
                    Your curated bookstore for knowledge and discovery
                </Typography>
                
                <Box sx={{ maxWidth: '500px', width: '90%', mx: 'auto' }}> 
                  <TextField
                      fullWidth
                      placeholder="Search books, authors, or genres"
                      variant="outlined"
                      size="medium"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      InputProps={{
                          startAdornment: (
                          <InputAdornment position="start">
                              <SearchIcon sx={{ color: 'primary.contrastText', opacity: 0.7 }} />
                          </InputAdornment>
                          ),
                          sx: { 
                              borderRadius: '25px',
                              bgcolor: 'rgba(255, 255, 255, 0.15)',
                              color: 'primary.contrastText',
                              transition: theme.transitions.create(['background-color', 'box-shadow']),
                              input: { 
                                color: 'primary.contrastText', 
                                padding: '12px 14px',
                                '&::placeholder': {
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  opacity: 1,
                                }
                              },
                              '&:hover': { 
                                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgba(255, 255, 255, 0.7)'
                                  }
                              },
                              '& .MuiOutlinedInput-notchedOutline': { 
                                  borderColor: 'rgba(255, 255, 255, 0.5)',
                                  borderWidth: '1px',
                              },
                              '&.Mui-focused': {
                                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                                boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'primary.contrastText',
                                  borderWidth: '1px',
                                }
                              },
                           }
                      }}
                  />
                </Box>
              </motion.div>
          </Container>
      </Box>

      <Paper square elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Container maxWidth="xl">
              <Tabs
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  aria-label="Book Categories"
                  sx={{ 
                      '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
                      '& .MuiTabs-indicator': { height: 3 }
                   }}
              >
                  {bookCategories.map((category) => (
                      <Tab key={category} label={category} value={category} />
                  ))}
              </Tabs>
          </Container>
      </Paper>

      <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
             <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                    labelId="sort-by-label"
                    value={sortBy}
                    label="Sort By"
                    onChange={handleSortChange}
                    variant="outlined"
                 >
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="title_asc">Title (A-Z)</MenuItem>
                    <MenuItem value="title_desc">Title (Z-A)</MenuItem>
                    <MenuItem value="year_asc">Year (Oldest)</MenuItem>
                    <MenuItem value="year_desc">Year (Newest)</MenuItem>
                </Select>
             </FormControl>
          </Box>

        {isLoading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh', py: 5 }}>
                 <CircularProgress size={60} />
             </Box>
         ) : error ? (
             <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
         ) : sortedBooks.length > 0 ? (
          <Box>
            <motion.div
              key={currentPage + sortBy}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: theme.spacing(3)
              }}>
                {sortedBooks.map((book) => (
                  <motion.div key={book.id} variants={itemVariants} style={{ height: '100%' }}>
                    <Box sx={{ height: '100%' }}> 
                      <BookCard book={book} />
                    </Box>
                  </motion.div> 
                ))}
              </Box>
            </motion.div>
            
            {totalPages > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh', py: 5 }}>
                <Typography sx={{ textAlign: 'center' }}>
                    No books found matching your criteria. Try a different search.
                </Typography>
            </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage; 