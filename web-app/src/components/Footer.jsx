function Footer() {
    return (
        <footer className="footer" id="footer">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <a href="#" className="footer-logo">
                            <img src="https://m.media-amazon.com/images/X/bxt1/M/Bbxt1BI1cNpD5ln._SL160_QL95_FMwebp_.png" alt="Sovely Logo" className="logo-image" />
                            <span className="logo-text">Sovely</span>
                        </a>
                        <p className="footer-tagline">
                            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link" aria-label="Facebook">📘</a>
                            <a href="#" className="social-link" aria-label="Twitter">🐦</a>
                            <a href="#" className="social-link" aria-label="Instagram">📷</a>
                            <a href="#" className="social-link" aria-label="LinkedIn">💼</a>
                        </div>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="footer-heading">Department</h4>
                        <ul className="footer-links">
                            <li><a href="#">Fashion</a></li>
                            <li><a href="#">Education Product</a></li>
                            <li><a href="#">Frozen Food</a></li>
                            <li><a href="#">Beverages</a></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="footer-heading">About Us</h4>
                        <ul className="footer-links">
                            <li><a href="#">About Sovely</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">News & Blog</a></li>
                            <li><a href="#">Help</a></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="footer-heading">Services</h4>
                        <ul className="footer-links">
                            <li><a href="#">Gift Card</a></li>
                            <li><a href="#">Mobile App</a></li>
                            <li><a href="#">Shipping & Delivery</a></li>
                            <li><a href="#">Order Pickup</a></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="footer-heading">Help</h4>
                        <ul className="footer-links">
                            <li><a href="#">Sovely Help</a></li>
                            <li><a href="#">Returns</a></li>
                            <li><a href="#">Track Orders</a></li>
                            <li><a href="#">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-cta-row">
                    <a href="#" className="footer-cta-card">
                        <span className="cta-icon">🏪</span>
                        <span>Become Seller</span>
                    </a>
                    <a href="#" className="footer-cta-card">
                        <span className="cta-icon">🎁</span>
                        <span>Gift Cards</span>
                    </a>
                    <a href="#" className="footer-cta-card">
                        <span className="cta-icon">❓</span>
                        <span>Help Center</span>
                    </a>
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">© 2024 Sovely. All rights reserved.</p>
                    <div className="footer-legal">
                        <a href="#">Terms of Service</a>
                        <a href="#">Privacy & Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
