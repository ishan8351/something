import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WishlistContext } from '../WishlistContext';
import { CartContext } from '../CartContext';
import { X, Trash2, Heart, ShoppingCart } from 'lucide-react';
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
                const itemsToDraw = wishlistItems.map((item) => {
                    if (item && item.name && item.price) return item;
                    if (item && item.productId) return item.productId;
                    return item;
                });
                setFullWishlistProducts(itemsToDraw);
            } catch (error) {
                console.error('Error organizing wishlist objects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFullProducts();
    }, [isOpen, wishlistItems]);

    const formatPrice = (price) => {
        if (typeof price === 'number') return `₹${price.toLocaleString('en-IN')}`;
        return price;
    };

    const getItemSafe = (item) => {
        const id = item._id || item.id || item;
        const name = item.name || item.title || 'Product Name';
        const price = item.price || item.platformSellPrice || 0;

        let extractedImage =
            'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&q=80';
        if (item.images && item.images.length > 0) {
            extractedImage =
                typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url;
        } else if (item.image) {
            extractedImage = typeof item.image === 'string' ? item.image : item.image.url;
        }

        return { id, name, price, image: extractedImage, src: item };
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {}
            <div
                className="absolute inset-0 animate-[fadeIn_0.2s_ease-out] bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {}
            <div
                className="relative flex h-full w-full max-w-md animate-[slideInRight_0.3s_ease-out] flex-col bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white/80 p-6 backdrop-blur-md">
                    <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                        Your Wishlist
                        <span className="bg-danger rounded-full px-2 py-0.5 text-xs text-white">
                            {wishlistItems?.length || 0}
                        </span>
                    </h2>
                    <button
                        className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        onClick={onClose}
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {}
                <div className="custom-scrollbar flex-1 overflow-y-auto bg-slate-50/50 p-6">
                    {!wishlistItems || wishlistItems.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                                <Heart size={32} />
                            </div>
                            <div>
                                <h3 className="mb-1 text-lg font-bold text-slate-900">
                                    Your wishlist is empty
                                </h3>
                                <p className="text-sm font-medium text-slate-500">
                                    Save items you love here to review them later.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-4 rounded-full border border-slate-200 bg-white px-6 py-3 font-bold text-slate-900 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                            >
                                Discover Products
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center py-10">
                            <div className="border-t-accent h-8 w-8 animate-spin rounded-full border-2 border-slate-200"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fullWishlistProducts.map((rawItem, idx) => {
                                const item = getItemSafe(rawItem);
                                return (
                                    <div
                                        key={item.id || idx}
                                        className="group hover:border-accent/30 flex cursor-pointer gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-md"
                                        onClick={() => {
                                            navigate(`/product/${item.id}`);
                                            onClose();
                                        }}
                                    >
                                        <div className="h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>

                                        <div className="flex flex-1 flex-col py-1">
                                            <h4 className="group-hover:text-accent mb-1 line-clamp-2 text-sm leading-snug font-bold text-slate-900 transition-colors">
                                                {item.name}
                                            </h4>
                                            <div className="mb-3 text-sm font-extrabold text-slate-900">
                                                {formatPrice(item.price)}
                                            </div>

                                            <div className="mt-auto flex items-center gap-2">
                                                <button
                                                    className="hover:bg-accent hover:shadow-accent/20 flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-all hover:shadow-md"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart({
                                                            id: item.id,
                                                            name: item.name,
                                                            price:
                                                                typeof item.price === 'string'
                                                                    ? parseFloat(
                                                                          item.price.replace(
                                                                              /[^0-9.-]+/g,
                                                                              ''
                                                                          )
                                                                      )
                                                                    : item.price,
                                                            image: item.image,
                                                            sku:
                                                                rawItem.sku ||
                                                                rawItem.skuId ||
                                                                `SKU-${item.id}`,
                                                        });
                                                        toggleWishlist({ id: item.id });
                                                    }}
                                                >
                                                    <ShoppingCart size={14} /> Add to Cart
                                                </button>
                                                <button
                                                    className="hover:text-danger hover:border-danger hover:bg-danger/5 rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-400 transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishlist({ id: item.id });
                                                    }}
                                                >
                                                    <Trash2 size={16} />
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
