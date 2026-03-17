import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../features/products/api/productApi';
import { CartContext } from '../CartContext';
import { WishlistContext } from '../WishlistContext';

function BestDeals() {
    const { cartItems, addToCart, updateQuantity } = useContext(CartContext);
    const { isInWishlist, toggleWishlist } = useContext(WishlistContext);

    const {
        data: deals = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['bestDeals'],
        queryFn: () => productApi.getBestDeals(3),
        staleTime: 5 * 60 * 1000,
    });

    return (
        <section className="deals-section" id="deals">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">Todays Best Deals For You!</h2>
                </div>

                {isLoading ? (
                    <div className="deals-grid">
                        {[1, 2, 3].map((i) => (
                            <div
                                className="deal-card"
                                key={i}
                                style={{ minHeight: '380px', opacity: 0.6 }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        backgroundColor: '#e2e8f0',
                                        borderRadius: '12px 12px 0 0',
                                    }}
                                ></div>
                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '70%',
                                            height: '16px',
                                            backgroundColor: '#cbd5e1',
                                            borderRadius: '4px',
                                        }}
                                    ></div>
                                    <div
                                        style={{
                                            width: '90%',
                                            height: '12px',
                                            backgroundColor: '#e2e8f0',
                                            borderRadius: '4px',
                                        }}
                                    ></div>
                                    <div
                                        style={{
                                            width: '40%',
                                            height: '20px',
                                            backgroundColor: '#cbd5e1',
                                            borderRadius: '4px',
                                        }}
                                    ></div>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '40px',
                                            backgroundColor: '#e2e8f0',
                                            borderRadius: '8px',
                                            marginTop: 'auto',
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                        Unable to load deals right now.
                    </p>
                ) : deals.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                        No deals available at the moment.
                    </p>
                ) : (
                    <div className="deals-grid">
                        {deals.map((deal) => {
                            const badge = deal.discountPercent ? `-${deal.discountPercent}%` : null;
                            const image =
                                deal.images?.[0]?.url ||
                                'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&q=80';
                            const priceFormatted = `₹${deal.platformSellPrice.toLocaleString('en-IN')}`;
                            const oldPriceFormatted = deal.compareAtPrice
                                ? `₹${deal.compareAtPrice.toLocaleString('en-IN')}`
                                : null;
                            const cartItem = cartItems.find((item) => item.product.id === deal._id);

                            return (
                                <div
                                    className="deal-card"
                                    key={deal._id}
                                    id={`deal-${deal._id}`}
                                    style={{ position: 'relative' }}
                                >
                                    {badge && <div className="deal-badge">{badge}</div>}
                                    <button
                                        className={`pc-wishlist-btn ${isInWishlist(deal._id) ? 'pc-wishlist-active' : ''}`}
                                        style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            zIndex: 10,
                                            background: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            padding: '6px',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleWishlist({ id: deal._id, ...deal });
                                        }}
                                        aria-label="Toggle Wishlist"
                                    >
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill={isInWishlist(deal._id) ? 'currentColor' : 'none'}
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                    </button>
                                    <Link
                                        to={`/product/${deal._id}`}
                                        className="deal-image-wrapper"
                                    >
                                        <img src={image} alt={deal.title} className="deal-image" />
                                    </Link>
                                    <div className="deal-info">
                                        <Link
                                            to={`/product/${deal._id}`}
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <h3 className="deal-name">{deal.title}</h3>
                                        </Link>
                                        <p className="deal-description">
                                            {deal.categoryId?.name || ''}
                                        </p>
                                        <p className="deal-sku-text">SKU: {deal.sku}</p>
                                        <div className="deal-pricing">
                                            <span className="deal-price">{priceFormatted}</span>
                                            {oldPriceFormatted && (
                                                <span className="deal-old-price">
                                                    {oldPriceFormatted}
                                                </span>
                                            )}
                                        </div>
                                        {cartItem ? (
                                            <div className="cart-quantity-controls">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        updateQuantity(deal._id, -1);
                                                    }}
                                                >
                                                    -
                                                </button>
                                                <span>{cartItem.quantity}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        updateQuantity(deal._id, 1);
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn-add-cart"
                                                id={`btn-add-cart-${deal._id}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart({
                                                        id: deal._id,
                                                        name: deal.title,
                                                        price: deal.platformSellPrice,
                                                        image: image,
                                                        sku: deal.sku,
                                                    });
                                                }}
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

export default BestDeals;
