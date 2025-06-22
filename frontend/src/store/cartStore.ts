import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Book } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (book, quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === book.id);
          if (existingItem) {
            // Update quantity (respecting stock if it were available)
            const updatedItems = state.items.map((item) =>
              item.id === book.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
            return { items: updatedItems };
          } else {
            // Add new item: Create CartItem structure with a default price
            const price = 10.99; // Assign a default price
            const newItem: CartItem = {
               ...book, // Spread fields from Book (id, title, author, etc.)
               price: price, // Add the mandatory price
               quantity 
            };
            return { items: [...state.items, newItem] };
          }
        }),

      removeItem: (bookId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== bookId),
        })),

      updateQuantity: (bookId, quantity) =>
        set((state) => {
          const newQuantity = Math.max(0, quantity); // Ensure non-negative
          return {
            items: state.items.map((item) =>
              item.id === bookId ? { ...item, quantity: newQuantity } : item
            ).filter(item => item.quantity > 0), 
          };
        }),

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
); 