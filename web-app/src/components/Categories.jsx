import { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../features/products/api/productApi';
import { getCategoryIcon } from '../utils/categoryIcons';

function Categories({ onSelectCategory }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const { data: dbCategories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: productApi.getCategories
    });

    const categories = dbCategories.map(cat => {
        const visual = getCategoryIcon(cat.name);
        return {
            _id: cat._id,
            name: cat.name,
            Icon: visual.Icon,
            color: visual.color,
            iconColor: visual.iconColor
        };
    });

    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', updateScrollState);
            updateScrollState();
        }
        return () => el?.removeEventListener('scroll', updateScrollState);
    }, []);

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
        }
    };

    return (
        <section className="categories-section" id="categories">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">Shop Our Top Categories</h2>
                    <p className="section-subtitle">Discover products across all major niches</p>
                </div>

                <div className="categories-carousel-wrapper">
                    {/* Left Arrow */}
                    <button
                        className={`carousel-arrow carousel-arrow-left ${!canScrollLeft ? 'carousel-arrow-hidden' : ''}`}
                        onClick={() => scroll(-1)}
                        aria-label="Scroll categories left"
                    >
                        ‹
                    </button>

                    {/* Scrollable Track */}
                    <div className="categories-track" ref={scrollRef}>
                        {categories.map((cat, index) => (
                            <button
                                key={cat._id || index}
                                className="category-card"
                                id={`category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                                style={{ border: 'none', cursor: 'pointer', textAlign: 'center' }}
                            >
                                <div className="category-icon" style={{ backgroundColor: cat.color, color: cat.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <cat.Icon size={24} strokeWidth={1.8} />
                                </div>
                                <span className="category-name">{cat.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    <button
                        className={`carousel-arrow carousel-arrow-right ${!canScrollRight ? 'carousel-arrow-hidden' : ''}`}
                        onClick={() => scroll(1)}
                        aria-label="Scroll categories right"
                    >
                        ›
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Categories;
