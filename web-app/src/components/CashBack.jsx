function CashBack() {
    return (
        <section className="cashback-section" id="cashback">
            <div className="section-container">
                <div className="cashback-banner">
                    <div className="cashback-content">
                        <span className="cashback-badge">Limited Offer</span>
                        <h2 className="cashback-title">Get 5% Cash Back On $200</h2>
                        <p className="cashback-text">
                            Shopping is a bit of a relaxing hobby for me, which is sometimes
                            troubling for the bank balance.
                        </p>
                        <button className="btn-primary" id="btn-learn-more">
                            Learn More →
                        </button>
                    </div>
                    <div className="cashback-card-visual">
                        <div className="credit-card">
                            <div className="card-chip">
                                <div className="chip-line"></div>
                                <div className="chip-line"></div>
                            </div>
                            <div className="card-number">**** **** **** 4582</div>
                            <div className="card-details">
                                <div className="card-holder">
                                    <span className="card-label">Card Holder</span>
                                    <span className="card-value">SOVELY USER</span>
                                </div>
                                <div className="card-expiry">
                                    <span className="card-label">Expires</span>
                                    <span className="card-value">12/26</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CashBack;
