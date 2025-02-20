import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Book } from '../types'; // Import Book from types

interface WishlistState {
  items: Book[];
  addToWishlist: (book: Book) => void;
  removeFromWishlist: (bookId: string) => void;
  isWishlisted: (bookId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (book) =>
        set((state) => {
          // Avoid duplicates
          if (!state.items.some(item => item.id === book.id)) {
            return { items: [...state.items, book] };
          }
          return state; // Return current state if book already exists
        }),
      removeFromWishlist: (bookId) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== bookId) })),
      isWishlisted: (bookId) => {
        return get().items.some(item => item.id === bookId);
      },
    }),
    {
      name: 'wishlist-storage', // Name of the item in storage (must be unique)
      storage: createJSONStorage(() => localStorage), // Use localStorage
    }
  )
); 