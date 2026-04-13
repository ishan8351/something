import { Link } from 'react-router-dom';
import { getSellingProducts } from '../data/productData';

const products = getSellingProducts();

function MostSelling() {
    return (
        <section className="selling-section" id="most-selling">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">Most Selling Products</h2>
                    <a href="#" className="section-link">
                        See all →
                    </a>
                </div>
                <div className="selling-grid">
                    {products.map((product) => (
                        <Link
                            to={`/product/${product.id}`}
                            className="selling-card"
                            key={product.id}
                            id={`selling-${product.id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="selling-image-wrapper">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="selling-image"
                                />
                            </div>
                            <div className="selling-info">
                                <h4 className="selling-name">{product.name}</h4>
                                <p className="selling-subtitle">
                                    {product.description.slice(0, 40)}
                                </p>
                                <p className="selling-sku-text">SKU: {product.skuId}</p>
                                <span className="selling-price">{product.price}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default MostSelling;
