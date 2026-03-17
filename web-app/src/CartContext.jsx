import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const localData = localStorage.getItem('sovely_cart');
        return localData ? JSON.parse(localData) : [];
    });

    useEffect(() => {
        localStorage.setItem('sovely_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // --- NEW HELPER: Dynamically calculate price based on tiers ---
    const calculateDynamicPrice = (product, quantity) => {
        let price = product.price || product.basePrice || 0;
        if (product.tiers && Array.isArray(product.tiers)) {
            for (const tier of product.tiers) {
                if (quantity >= tier.min) {
                    price = tier.price;
                }
            }
        }
        return price;
    };

    const addToCart = (product, quantity = 1) => {
        setCartItems((prev) => {
            const existing = prev.find(
                (item) => item.product._id === product._id || item.product.id === product.id
            );
            if (existing) {
                return prev.map((item) => {
                    if (item.product._id === product._id || item.product.id === product.id) {
                        const newQuantity = item.quantity + quantity;
                        return {
                            ...item,
                            quantity: newQuantity,
                            // Ensure the stored price is updated based on new quantity
                            price: calculateDynamicPrice(item.product, newQuantity),
                        };
                    }
                    return item;
                });
            }

            // First time adding, calculate the tier price based on initial quantity
            const initialPrice = calculateDynamicPrice(product, quantity);
            return [...prev, { product, quantity, price: initialPrice }];
        });
    };

    const setExactQuantity = (productId, newQuantity) => {
        setCartItems((prev) => {
            return prev.map((item) => {
                const isMatch = item.product._id === productId || item.product.id === productId;
                if (isMatch) {
                    const safeQuantity = Math.max(1, parseInt(newQuantity) || 1);
                    return {
                        ...item,
                        quantity: safeQuantity,
                        price: calculateDynamicPrice(item.product, safeQuantity),
                    };
                }
                return item;
            });
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prev) =>
            prev.filter((item) => item.product._id !== productId && item.product.id !== productId)
        );
    };

    const updateQuantity = (productId, change) => {
        setCartItems((prev) => {
            return prev
                .map((item) => {
                    const isMatch = item.product._id === productId || item.product.id === productId;
                    if (isMatch) {
                        const newQuantity = item.quantity + change;
                        if (newQuantity <= 0) return null;
                        return {
                            ...item,
                            quantity: newQuantity,
                            price: calculateDynamicPrice(item.product, newQuantity),
                        };
                    }
                    return item;
                })
                .filter(Boolean);
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                setExactQuantity,
                clearCart,
                calculateDynamicPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
