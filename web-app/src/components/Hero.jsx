
import heroImg from '../assets/hero-shopping.png';

function Hero({ onShopNow }) {
    const handleShopNow = () => {
        if (onShopNow) {
            onShopNow();
        }
    };

    return (
        <section className="hero-section" id="hero">
            <div className="hero-container">
                <div className="hero-content">
                    <p className="hero-subtitle">Shopping And Department Store.</p>
                    <h1 className="hero-title">
                        Shopping is a bit of a relaxing hobby for me, which is sometimes troubling for the bank balance.
                    </h1>
                    <div className="hero-actions">
                        <button className="btn-primary" id="btn-shop-now" onClick={handleShopNow}>
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
                    <img
                        src={heroImg}
                        alt="Stylish shopping experience"
                        className="hero-image"
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            height: '400px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-xl)',
                            position: 'relative',
                            zIndex: 1,
                            boxShadow: 'var(--shadow-xl)',
                        }}
                    />
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
