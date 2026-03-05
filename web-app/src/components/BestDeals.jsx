

const deals = [
    {
        id: 1,
        name: 'HomePod mini',
        description: 'Table with air purifier, stained veneer black',
        price: '₹8,299',
        oldPrice: '₹10,999',
        image: 'https://via.placeholder.com/300x300.png?text=HomePod+mini',
        badge: '-25%',
    },
    {
        id: 2,
        name: 'Instax Mini 9',
        description: 'Selfie mode and selfie mirror, Macro mode',
        price: '₹5,799',
        oldPrice: '₹7,499',
        image: 'https://via.placeholder.com/300x300.png?text=Instax+Mini+9',
        badge: '-23%',
    },
    {
        id: 3,
        name: 'Base Camp Duffel M',
        description: 'Table with air purifier, stained veneer black',
        price: '₹12,499',
        oldPrice: '₹16,999',
        image: 'https://via.placeholder.com/300x300.png?text=Duffel+Bag',
        badge: '-25%',
    },
];

function BestDeals() {
    return (
        <section className="deals-section" id="deals">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">Todays Best Deals For You!</h2>
                </div>
                <div className="deals-grid">
                    {deals.map((deal) => (
                        <div className="deal-card" key={deal.id} id={`deal-${deal.id}`}>
                            <div className="deal-badge">{deal.badge}</div>
                            <div className="deal-image-wrapper">
                                <img src={deal.image} alt={deal.name} className="deal-image" />
                            </div>
                            <div className="deal-info">
                                <h3 className="deal-name">{deal.name}</h3>
                                <p className="deal-description">{deal.description}</p>
                                <div className="deal-pricing">
                                    <span className="deal-price">{deal.price}</span>
                                    <span className="deal-old-price">{deal.oldPrice}</span>
                                </div>
                                <button className="btn-add-cart" id={`btn-add-cart-${deal.id}`}>Add to Cart</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default BestDeals;
