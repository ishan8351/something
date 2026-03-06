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

    // Add any quantity to cart given the minimal product info structure
    const addToCart = (product, quantity = 1) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });
    };

    // Remove completely from cart
    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
    };

    // + / - 1 mechanism
    const updateQuantity = (productId, change) => {
        setCartItems(prev => {
            return prev.map(item => {
                if (item.product.id === productId) {
                    const newQuantity = item.quantity + change;
                    if (newQuantity <= 0) return null; // Marked for deletion
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(Boolean); // Filter out the nulls (deleted items)
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
