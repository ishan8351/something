

function Hero() {
    return (
        <section className="hero-section" id="hero">
            <div className="hero-container">
                <div className="hero-content">
                    <p className="hero-subtitle">Shopping And Department Store.</p>
                    <h1 className="hero-title">
                        Shopping is a bit of a relaxing hobby for me, which is sometimes troubling for the bank balance.
                    </h1>
                    <div className="hero-actions">
                        <button className="btn-primary" id="btn-shop-now">
                            Shop Now →
                        </button>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="stat-icon">📦</span>
                            <div>
                                <strong>Free Shipping</strong>
                                <p>On orders over ₹999</p>
                            </div>
                        </div>
                        <div className="hero-stat">
                            <span className="stat-icon">🔄</span>
                            <div>
                                <strong>Easy Returns</strong>
                                <p>30 day return policy</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-image-wrapper">
                    <div className="hero-image-bg"></div>
                    <div className="hero-image placeholder" style={{ width: '100%', maxWidth: '500px', height: '400px', background: '#e5e7eb', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', position: 'relative', zIndex: 1, boxShadow: 'var(--shadow-xl)' }}>Hero Image Placeholder</div>
                    <div className="hero-floating-card">
                        <span className="floating-emoji">🔥</span>
                        <div>
                            <strong>50% OFF</strong>
                            <p>Summer Collection</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
