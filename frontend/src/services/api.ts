import axios from 'axios';
import { CartItem, Book, User } from '../types';
import { useAuthStore } from '../store/authStore';
import { LoginCredentials, RegisterCredentials } from '../types/auth';

// Determine API base URL, checking all possible origins
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? `http://${window.location.hostname}:4242/api/v1` 
    : 'https://shelf-api.shaily.dev/api/v1');

const OPEN_LIBRARY_URL = 'https://openlibrary.org';
const COVER_BASE_URL = 'https://covers.openlibrary.org/b/id/';

console.log("API Base URL:", API_BASE_URL); // Debugging

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Changed from true to false to avoid CORS preflight complexity
});

// --- Axios Interceptor for Auth Token ---
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // For debugging CORS issues
    console.log("Request headers:", config.headers);
    // Debug the full request URL
    console.log(`Making request to: ${config.baseURL || ''}${config.url || ''}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Successful response from: ${response.config.url || ''}`);
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.message);
      const baseUrl = error.config?.baseURL || '';
      const url = error.config?.url || '';
      console.error("Full Request URL:", baseUrl + url);
      console.error("Request Method:", error.config?.method);
      console.error("Response Status:", error.response?.status);
      console.error("Response Data:", error.response?.data);
    }
    return Promise.reject(error);
  }
);

// --- Auth Service ---

export const login = async (credentials: LoginCredentials): Promise<{ access_token: string, token_type: string }> => {
  const params = new URLSearchParams();
  params.append('username', credentials.email);
  params.append('password', credentials.password);
  
  const response = await apiClient.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<User> => {
  const response = await apiClient.post<User>('/auth/register', credentials);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

// --- Orders Service ---

export interface Order {
  id: number;
  user_id: number;
  amount: number;
  stripe_session_id: string;
  status: string;
  created_at: string;
  order_details: string;
}

export const getUserOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get<Order[]>('/orders/me');
  return response.data;
};

// --- Open Library Service ---
interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number; // Cover ID is crucial
  subject?: string[];
  // We don't fetch description directly in search for performance, could fetch separately if needed
}

interface OpenLibrarySearchResponse {
  docs: OpenLibraryDoc[];
  numFound: number;
}

const getImageUrl = (coverId?: number, size: 'M' | 'L' = 'M') => {
  return coverId 
    ? `${COVER_BASE_URL}${coverId}-${size}.jpg` 
    : `https://via.placeholder.com/240x360.png?text=No+Cover`; // Match aspect ratio
};

export interface SearchBooksParams {
  query: string;
  page?: number;
  limit?: number;
  // Add other potential params like subject if needed
}

export interface SearchBooksResponse {
    books: Book[];
    totalResults: number;
}

// Fetch books from Open Library, filtering for those with cover IDs
export const searchBooks = async (
  params: SearchBooksParams
): Promise<SearchBooksResponse> => {
  const { query, page = 1, limit = 24 } = params; // Default to more items per page
  try {
    const response = await axios.get<OpenLibrarySearchResponse>(`${OPEN_LIBRARY_URL}/search.json`, {
      params: {
        q: query || 'science fiction OR fantasy OR history OR biography', // Default to safer genres
        fields: 'key,title,author_name,first_publish_year,cover_i,subject',
        limit: limit + 20, // Fetch more initially to allow filtering
        page,
        // Note: OpenLibrary sort options are limited (e.g., relevance, new, old)
        // sort: 'new' 
      },
    });

    const booksWithCovers: Book[] = response.data.docs
      .filter(doc => doc.cover_i) // **** Filter out books without a cover ID ****
      .map((doc) => ({
        id: doc.key,
        title: doc.title,
        author: doc.author_name?.join(', ') || 'Unknown Author',
        imageUrl: getImageUrl(doc.cover_i),
        publishedYear: doc.first_publish_year,
        subjects: doc.subject?.filter(s => s.length < 30).slice(0, 5) || [], // Filter short subjects
        coverId: doc.cover_i,
        price: 10.99 // Add a default price here
    })).slice(0, limit); // Limit results *after* filtering

    // totalResults is an estimate from OpenLibrary, might not match filtered results
    const effectiveTotal = Math.max(booksWithCovers.length, response.data.numFound); 

    return { books: booksWithCovers, totalResults: effectiveTotal };

  } catch (error) {
    console.error("Error searching books:", error);
    throw new Error('Failed to fetch books from Open Library.'); 
  }
};

// --- Stripe Checkout Service (Updated Endpoint) ---

export const createCheckoutSession = async (items: CartItem[]) => {
  try {
    console.log("Creating checkout session with items:", items);
    // This should match the route defined in backend/app/api/api.py
    const response = await apiClient.post<{ sessionId: string }>('/stripe/create-checkout-session', { items });
    console.log("Checkout session created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error details:", error.response.data);
      throw new Error(error.response.data?.detail || error.response.data?.error?.message || 'Failed to create checkout session');
    } else {
      throw new Error('An unknown error occurred during checkout.');
    }
  }
};

export default apiClient; 