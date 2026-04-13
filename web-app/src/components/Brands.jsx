const brands = [
    { name: 'Staples', delivery: 'Delivery within 24 hours', initial: 'S', color: '#DC2626' },
    { name: 'Sprouts', delivery: 'Delivery within 24 hours', initial: 'S', color: '#16A34A' },
    {
        name: 'Grocery Outlet',
        delivery: 'Delivery within 24 hours',
        initial: 'G',
        color: '#2563EB',
    },
    { name: 'Mollie Stones', delivery: 'Delivery within 24 hours', initial: 'M', color: '#9333EA' },
];

function Brands() {
    return (
        <section className="brands-section" id="brands">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">Choose By Brand</h2>
                </div>
                <div className="brands-grid">
                    {brands.map((brand, index) => (
                        <a
                            href="#"
                            className="brand-card"
                            key={index}
                            id={`brand-${brand.name.toLowerCase().replace(' ', '-')}`}
                        >
                            <div className="brand-logo" style={{ backgroundColor: brand.color }}>
                                {brand.initial}
                            </div>
                            <div className="brand-info">
                                <h3 className="brand-name">{brand.name}</h3>
                                <p className="brand-delivery">
                                    <span className="delivery-icon">🚚</span>
                                    {brand.delivery}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Brands;
