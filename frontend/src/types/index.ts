// Structure for data processed from Open Library Search API
export interface Book {
  id: string; // Open Library key (e.g., works/OL123W)
  title: string;
  author?: string; // Author name might be fetched later
  authorId?: string; // Open Library author key (e.g., /authors/OL123A)
  // Allow description to be the complex object from OpenLibrary
  description?: string | { type: string; value: string }; 
  imageUrl?: string; // Optional as cover might not exist
  publishedYear?: number;
  first_publish_date?: string; // Add raw publish date string
  subjects?: string[]; 
  coverId?: number; 
  covers?: number[]; // Add covers array from OpenLibrary
  price: number; // Add price, assuming it's added somehow
}

// CartItem includes Book properties plus quantity
export interface CartItem extends Book {
  quantity: number;
}

// User type matching the backend API response (e.g., from /auth/me)
export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
} 