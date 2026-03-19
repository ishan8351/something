import { create } from 'zustand';
import api from '../utils/api';

export const useCartStore = create((set, get) => ({
    cart: null,
    isLoading: false,
    error: null,

    // Derived selector for the Navbar badge
    getCartCount: () => {
        const cart = get().cart;
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    },

    // 1. Fetch the cart from our new backend
    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get('/cart');
            set({ cart: res.data.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch cart',
                isLoading: false,
            });
        }
    },

    // 2. Add to Cart (Tells backend intent: DROPSHIP or WHOLESALE)
    addToCart: async (productId, qty, orderType, resellerSellingPrice = 0) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/cart', {
                productId,
                qty,
                orderType, // 'DROPSHIP' or 'WHOLESALE'
                resellerSellingPrice,
            });
            // Backend recalculates everything and returns the fresh cart
            set({ cart: res.data.data, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    // 3. Update Quantity or Dropship Selling Price
    updateCartItem: async (productId, qty, resellerSellingPrice) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.put(`/cart/${productId}`, { qty, resellerSellingPrice });
            set({ cart: res.data.data, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
        }
    },

    // 4. Remove Item
    removeFromCart: async (productId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.delete(`/cart/${productId}`);
            set({ cart: res.data.data, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
        }
    },

    // Call this on logout
    clearCartState: () => set({ cart: null }),
}));
