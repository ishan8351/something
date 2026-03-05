import { useRef, useState, useEffect } from 'react';

const categories = [
    { name: 'Electronics', emoji: '💻', color: '#D1FAE5' },
    { name: 'Home Decor', emoji: '🖼️', color: '#E0E7FF' },
    { name: 'Kitchen', emoji: '🍳', color: '#FFF7ED' },
    { name: 'Fitness', emoji: '🏋️', color: '#DCFCE7' },
    { name: 'Furniture', emoji: '🪑', color: '#F3E8FF' },
    { name: 'Beauty', emoji: '💄', color: '#FCE7F3' },
    { name: 'Hand Bags', emoji: '👜', color: '#FEE2E2' },
    { name: 'Sneakers', emoji: '👟', color: '#FEF3C7' },
    { name: 'Watches', emoji: '⌚', color: '#F1F5F9' },
    { name: 'Jewellery', emoji: '💍', color: '#FDF4FF' },
    { name: 'Pet Supplies', emoji: '🐾', color: '#FEF9C3' },
    { name: 'Toys', emoji: '🧸', color: '#EDE9FE' },
    { name: 'Books', emoji: '📚', color: '#DBEAFE' },
    { name: 'Travel', emoji: '✈️', color: '#F9FAFB' },
];

function Categories({ onSelectCategory }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

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
                                key={index}
                                className="category-card"
                                id={`category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                                style={{ border: 'none', cursor: 'pointer', textAlign: 'center' }}
                            >
                                <div className="category-icon" style={{ backgroundColor: cat.color }}>
                                    <span>{cat.emoji}</span>
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
