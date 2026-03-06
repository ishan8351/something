import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WishlistContext } from '../WishlistContext';
import { CartContext } from '../CartContext';
import { X, Trash2, ShoppingCart } from 'lucide-react';
import './WishlistDrawer.css';
import { productApi } from '../features/products/api/productApi';

function WishlistDrawer({ isOpen, onClose }) {
    const { wishlistItems, toggleWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [fullWishlistProducts, setFullWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFullProducts = async () => {
            if (!isOpen || !wishlistItems || wishlistItems.length === 0) return;

            setLoading(true);
            try {
                // Determine which items we need to fetch full details for
                const itemsToDraw = wishlistItems.map(item => {
                    // if it's already a full product object from optimistic UI
                    if (item && item.name && item.price) return item;
                    // if it's a backend item object
                    if (item && item.productId) return item.productId;
                    // if it's just an id string/object or it has title instead of name
                    return item;
                });
                setFullWishlistProducts(itemsToDraw);
            } catch (error) {
                console.error("Error organizing wishlist objects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFullProducts();
    }, [isOpen, wishlistItems]);

    const formatPrice = (price) => {
        if (typeof price === 'number') return `₹${price.toLocaleString('en-IN')}`;
        return price; // Fallback if string
    };

    // Safely extract properties
    const getItemSafe = (item) => {
        const id = item._id || item.id || item;
        const name = item.name || item.title || 'Product Name';
        const price = item.price || item.platformSellPrice || 0;

        let extractedImage = 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&q=80';
        if (item.images && item.images.length > 0) {
            extractedImage = typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url;
        } else if (item.image) {
            extractedImage = typeof item.image === 'string' ? item.image : item.image.url;
        }

        return { id, name, price, image: extractedImage, src: item };
    };

    if (!isOpen) return null;

    return (
        <div className="wishlist-drawer-overlay" onClick={onClose}>
            <div className={`wishlist-drawer ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="wishlist-drawer-header">
                    <h2>Your Wishlist ({wishlistItems?.length || 0})</h2>
                    <button className="wishlist-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="wishlist-drawer-body">
                    {!wishlistItems || wishlistItems.length === 0 ? (
                        <div className="wishlist-drawer-empty">
                            <p>Your wishlist is empty.</p>
                            <button onClick={onClose} className="btn-continue" style={{ padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Continue Shopping</button>
                        </div>
                    ) : loading ? (
                        <div className="wishlist-drawer-empty"><p>Loading...</p></div>
                    ) : (
                        <div className="wishlist-items-list">
                            {fullWishlistProducts.map((rawItem, idx) => {
                                const item = getItemSafe(rawItem);
                                return (
                                    <div key={item.id || idx} className="wishlist-item" onClick={() => {
                                        navigate(`/product/${item.id}`);
                                        onClose();
                                    }} style={{ cursor: 'pointer' }}>
                                        <img src={item.image} alt={item.name} className="wishlist-item-img" />
                                        <div className="wishlist-item-details">
                                            <h4 className="wishlist-item-title">{item.name}</h4>
                                            <div className="wishlist-item-price">
                                                {formatPrice(item.price)}
                                            </div>
                                            <div className="wishlist-item-actions">
                                                <button
                                                    className="btn-remove-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishlist({ id: item.id });
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                    Remove
                                                </button>
                                                <button
                                                    className="btn-add-to-cart-small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart({
                                                            id: item.id,
                                                            name: item.name,
                                                            price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : item.price,
                                                            image: item.image,
                                                            sku: rawItem.sku || rawItem.skuId || `SKU-${item.id}`
                                                        });
                                                        alert("Item moved to cart!");
                                                        toggleWishlist({ id: item.id }); // optional: remove from wishlist upon adding to cart
                                                    }}
                                                >
                                                    Move to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WishlistDrawer;
