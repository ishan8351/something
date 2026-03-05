import { Link } from 'react-router-dom';
import { getDealProducts } from '../data/productData';

const deals = getDealProducts();

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
                            {deal.badge && <div className="deal-badge">{deal.badge}</div>}
                            <Link to={`/product/${deal.id}`} className="deal-image-wrapper">
                                <img src={deal.image} alt={deal.name} className="deal-image" />
                            </Link>
                            <div className="deal-info">
                                <Link to={`/product/${deal.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h3 className="deal-name">{deal.name}</h3>
                                </Link>
                                <p className="deal-description">{deal.description}</p>
                                <p className="deal-sku-text">SKU: {deal.skuId}</p>
                                <div className="deal-pricing">
                                    <span className="deal-price">{deal.price}</span>
                                    {deal.oldPrice && <span className="deal-old-price">{deal.oldPrice}</span>}
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
