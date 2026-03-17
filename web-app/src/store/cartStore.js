import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const calculateDynamicPrice = (product, quantity) => {
    let price = product.platformSellPrice || product.price || product.basePrice || 0;

    if (product.customPrice) {
        price = product.customPrice;
    }

    if (product.tiers && Array.isArray(product.tiers)) {
        for (const tier of product.tiers) {
            if (quantity >= tier.min) {
                price = tier.price;
            }
        }
    }
    return price;
};

export const useCartStore = create(
    persist(
        (set) => ({
            cartItems: [],

            addToCart: (product, quantity = null) => {
                set((state) => {
                    const minQuantity = product.moq || 1;
                    const validQuantity =
                        quantity !== null ? Math.max(quantity, minQuantity) : minQuantity;

                    const existingItem = state.cartItems.find(
                        (item) => item.product._id === product._id || item.product.id === product.id
                    );

                    if (existingItem) {
                        return {
                            cartItems: state.cartItems.map((item) => {
                                if (
                                    item.product._id === product._id ||
                                    item.product.id === product.id
                                ) {
                                    const newQuantity = item.quantity + validQuantity;
                                    return {
                                        ...item,
                                        quantity: newQuantity,
                                        price: calculateDynamicPrice(item.product, newQuantity),
                                    };
                                }
                                return item;
                            }),
                        };
                    }

                    const initialPrice = calculateDynamicPrice(product, validQuantity);
                    return {
                        cartItems: [
                            ...state.cartItems,
                            { product, quantity: validQuantity, price: initialPrice },
                        ],
                    };
                });
            },

            addBulkToCart: (items) => {
                set((state) => {
                    let updatedCart = [...state.cartItems];

                    items.forEach(({ product, quantity }) => {
                        const minQuantity = product.moq || 1;
                        const validQuantity = Math.max(quantity, minQuantity);

                        const existingIndex = updatedCart.findIndex(
                            (item) =>
                                item.product._id === product._id || item.product.id === product.id
                        );

                        if (existingIndex >= 0) {
                            const newQuantity = updatedCart[existingIndex].quantity + validQuantity;
                            updatedCart[existingIndex] = {
                                ...updatedCart[existingIndex],
                                quantity: newQuantity,
                                price: calculateDynamicPrice(
                                    updatedCart[existingIndex].product,
                                    newQuantity
                                ),
                            };
                        } else {
                            updatedCart.push({
                                product,
                                quantity: validQuantity,
                                price: calculateDynamicPrice(product, validQuantity),
                            });
                        }
                    });

                    return { cartItems: updatedCart };
                });
            },

            setExactQuantity: (productId, newQuantity) => {
                set((state) => ({
                    cartItems: state.cartItems.map((item) => {
                        const isMatch =
                            item.product._id === productId || item.product.id === productId;

                        if (isMatch) {
                            const minQuantity = item.product.moq || 1;
                            const safeQuantity = Math.max(
                                minQuantity,
                                parseInt(newQuantity) || minQuantity
                            );

                            return {
                                ...item,
                                quantity: safeQuantity,
                                price: calculateDynamicPrice(item.product, safeQuantity),
                            };
                        }
                        return item;
                    }),
                }));
            },

            removeFromCart: (productId) => {
                set((state) => ({
                    cartItems: state.cartItems.filter(
                        (item) => item.product._id !== productId && item.product.id !== productId
                    ),
                }));
            },

            updateQuantity: (productId, change) => {
                set((state) => ({
                    cartItems: state.cartItems
                        .map((item) => {
                            const isMatch =
                                item.product._id === productId || item.product.id === productId;

                            if (isMatch) {
                                const newQuantity = item.quantity + change;
                                const minQuantity = item.product.moq || 1;

                                if (newQuantity <= 0) return null;

                                if (newQuantity < minQuantity) {
                                    alert(
                                        `Minimum order quantity for ${item.product.title} is ${minQuantity}`
                                    );
                                    return item;
                                }

                                return {
                                    ...item,
                                    quantity: newQuantity,
                                    price: calculateDynamicPrice(item.product, newQuantity),
                                };
                            }
                            return item;
                        })
                        .filter(Boolean),
                }));
            },

            clearCart: () => set({ cartItems: [] }),
        }),
        {
            name: 'sovely_cart',
        }
    )
);
