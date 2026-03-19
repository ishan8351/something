import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
    Star,
    Check,
    SlidersHorizontal,
    ChevronDown,
    X,
    ShieldCheck,
    Box,
    TrendingUp,
    Clock,
    Percent,
    ShoppingCart,
} from 'lucide-react';
import api from '../utils/api.js';
import { useCartStore } from '../store/cartStore';
import B2BFilterBar from './B2BFilterBar';

const SORT_OPTIONS = [
    { value: 'default', label: 'Recommended Suppliers' },
    { value: 'price-asc', label: 'Bulk Price: Low to High' },
    { value: 'price-desc', label: 'Bulk Price: High to Low' },
    { value: 'rating', label: 'Top Rated Suppliers' },
    { value: 'margin', label: 'Highest Profit Margin' },
];

function DropshipProducts({
    filters = {},
    globalSearchQuery = '',
    initialCategory = 'All Categories',
    customTitle = 'Verified Wholesale Inventory',
    customSubtitle = 'Source direct from manufacturers. Maximize your retail margins.',
    hideTitle = false,
}) {
    const addToCart = useCartStore((state) => state.addToCart);

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [category, setCategory] = useState('All Categories');
    const [sort, setSort] = useState('default');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState(0);
    const [addedIds, setAddedIds] = useState([]);

    const [b2bFilters, setB2bFilters] = useState({
        moq: filters.moq || 'all',
        margin: filters.margin || 'all',
        readyToShip: filters.readyToShip || false,
    });

    useEffect(() => {
        setB2bFilters({
            moq: filters.moq || 'all',
            margin: filters.margin || 'all',
            readyToShip: filters.readyToShip || false,
        });
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setB2bFilters((prev) => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        if (initialCategory) {
            setCategory(initialCategory);
        }
    }, [initialCategory]);

    // API Call: Fetch Categories
    const { data: rawCategories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data.data || [];
        },
    });

    const dbCategories = useMemo(
        () =>
            rawCategories.filter((cat, index, list) => {
                const normalizedName = cat.name.trim().toLowerCase();
                return (
                    index ===
                    list.findIndex((item) => item.name.trim().toLowerCase() === normalizedName)
                );
            }),
        [rawCategories]
    );

    const selectedCatId = useMemo(() => {
        if (category === 'All Categories') return null;
        const found = dbCategories.find((c) => c.name === category);
        return found ? found._id : null;
    }, [category, dbCategories]);

    useEffect(() => {
        if (globalSearchQuery) {
            setCategory('All Categories');
            setMinPrice('');
            setMaxPrice('');
            setMinRating(0);
        }
    }, [globalSearchQuery]);

    // API Call: Fetch Products with Infinite Scroll
    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
        queryKey: [
            'products',
            selectedCatId,
            sort,
            minPrice,
            maxPrice,
            minRating,
            b2bFilters,
            globalSearchQuery,
        ],
        queryFn: async ({ pageParam = 1 }) => {
            const params = new URLSearchParams({
                page: pageParam,
                limit: 24,
            });

            // 1. Category & Search
            if (selectedCatId) params.append('category', selectedCatId);
            if (globalSearchQuery) params.append('search', globalSearchQuery);

            // 2. Pricing & Sorting
            if (sort !== 'default') params.append('sort', sort);
            if (minPrice) params.append('minBasePrice', minPrice); // Note: Assuming you add this to backend later, backend currently only has maxBasePrice
            if (maxPrice) params.append('maxBasePrice', maxPrice);

            // 3. Margin Filter Mapping
            if (b2bFilters.margin === 'high-margin') {
                params.append('minMargin', '40');
            }

            // 4. MOQ Mapping (Dropship vs Bulk)
            if (b2bFilters.moq === 'under-50') {
                params.append('maxMoq', '50'); // Needs backend support
            } else if (b2bFilters.moq === '50-500') {
                params.append('minMoq', '50'); // Needs backend support
                params.append('maxMoq', '500');
            } else if (b2bFilters.moq === 'bulk') {
                params.append('minMoq', '500'); // Needs backend support
            }

            // 5. Inventory
            if (b2bFilters.readyToShip) {
                params.append('inStock', 'true'); // Needs backend support
            }

            const res = await api.get(`/products?${params.toString()}`);
            return res.data.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const page = lastPage?.pagination?.page ?? 1;
            const pages = lastPage?.pagination?.pages ?? 1;
            return page < pages ? page + 1 : undefined;
        },
    });

    const displayProducts = useMemo(() => {
        if (!data) return [];
        return data.pages
            .flatMap((page) => page.products || [])
            .map((p) => {
                const wholesalePrice = p.platformSellPrice || p.dropshipBasePrice;
                const retailMrp = p.compareAtPrice || Math.floor(wholesalePrice * 1.8);
                const estMargin = Math.round(((retailMrp - wholesalePrice) / retailMrp) * 100);

                return {
                    id: p._id,
                    skuId: p.sku || 'N/A',
                    vendor: p.vendor || 'Verified Supplier',
                    stock: p.inventory?.stock ?? 0,
                    name: p.title,
                    category: p.categoryId?.name || p.productType || 'Uncategorized',
                    price: wholesalePrice,
                    originalPrice: retailMrp,
                    margin: estMargin,
                    rating: p.averageRating || 4.5,
                    image:
                        p.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&q=80',
                    moq: p.moq || 10,
                    gst: p.gstSlab || 18,
                    isVerified: p.isVerifiedSupplier || true,
                    dispatchDays: p.shippingDays || 2,
                };
            });
    }, [data]);

    const resetFilters = () => {
        setCategory('All Categories');
        setSort('default');
        setMinPrice('');
        setMaxPrice('');
        setMinRating(0);

        if (globalSearchQuery) {
            window.history.pushState({}, '', window.location.pathname);
        }
    };

    // FIXED: Properly uses the new cartStore signature
    const handleAdd = async (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        setAddedIds((prev) => [...prev, product.id]);

        // addToCart(productId, qty, orderType, resellerSellingPrice)
        await addToCart(product.id, product.moq, 'WHOLESALE', 0);

        setTimeout(() => setAddedIds((prev) => prev.filter((x) => x !== product.id)), 1800);
    };

    return (
        <section className="relative z-10 w-full">
            {!hideTitle && (
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
                            {customTitle}
                        </h2>
                        {globalSearchQuery ? (
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                Search results for:{' '}
                                <span className="text-primary font-bold">
                                    "{globalSearchQuery}"
                                </span>
                            </p>
                        ) : (
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                {customSubtitle}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 md:hidden"
                            onClick={() => setIsMobileFilterOpen(true)}
                        >
                            <SlidersHorizontal size={16} /> Filters
                        </button>

                        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 shadow-sm transition-all focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
                            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Sort:
                            </span>
                            <div className="relative">
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="cursor-pointer appearance-none bg-transparent py-1 pr-6 text-sm font-bold text-slate-700 outline-none"
                                >
                                    {SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={14}
                                    className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-slate-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col items-start gap-8 md:flex-row">
                {isMobileFilterOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                )}

                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-72 transform overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 md:relative md:sticky md:top-32 md:z-0 md:h-fit md:w-64 md:translate-x-0 md:rounded-2xl md:border md:border-slate-200 md:bg-white md:p-6 md:shadow-sm ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                        <h3 className="text-lg font-extrabold text-slate-900">Advanced Filters</h3>
                        <div className="flex items-center gap-3">
                            <button
                                className="text-xs font-bold text-slate-500 transition-colors hover:text-slate-900"
                                onClick={resetFilters}
                            >
                                Clear
                            </button>
                            <button
                                className="p-1 text-slate-400 hover:text-slate-900 md:hidden"
                                onClick={() => setIsMobileFilterOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                <Box size={14} /> Categories
                            </h4>
                            <div className="custom-scrollbar max-h-48 space-y-2 overflow-y-auto pr-2">
                                {[{ _id: 'All', name: 'All Categories' }, ...dbCategories].map(
                                    (cat) => (
                                        <label
                                            key={cat._id || cat.name}
                                            className="group flex cursor-pointer items-center gap-3"
                                        >
                                            <div
                                                className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${category === cat.name ? 'border-slate-900 bg-slate-900' : 'border-slate-300 group-hover:border-slate-900'}`}
                                            >
                                                {category === cat.name && (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                checked={category === cat.name}
                                                onChange={() => setCategory(cat.name)}
                                            />
                                            <span
                                                className={`text-sm font-semibold transition-colors ${category === cat.name ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}
                                            >
                                                {cat.name}
                                            </span>
                                        </label>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Unit Price (₹)
                            </h4>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 transition-all outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                                    />
                                </div>
                                <span className="font-bold text-slate-300">-</span>
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 transition-all outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Supplier Rating
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {[4.5, 4.0, 3.5, 0].map((r) => (
                                    <button
                                        key={r}
                                        className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${minRating === r ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                                        onClick={() => setMinRating(r)}
                                    >
                                        {r === 0 ? (
                                            'Any'
                                        ) : (
                                            <>
                                                {r}+ <Star size={12} fill="currentColor" />
                                            </>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="w-full flex-1">
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                                >
                                    <div className="mb-4 aspect-[4/5] animate-pulse rounded-xl bg-slate-100"></div>
                                    <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-slate-100"></div>
                                    <div className="mb-4 h-4 w-1/2 animate-pulse rounded bg-slate-100"></div>
                                    <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100"></div>
                                </div>
                            ))}
                        </div>
                    ) : displayProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-24 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Box size={32} />
                            </div>
                            <h3 className="mb-2 text-xl font-extrabold text-slate-900">
                                No matching inventory
                            </h3>
                            <p className="mb-6 font-medium text-slate-500">
                                Try adjusting your filters, MOQ requirements, or categories.
                            </p>
                            <button
                                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                                onClick={resetFilters}
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {displayProducts.map((product) => {
                                    const isAdded = addedIds.includes(product.id);

                                    return (
                                        <div
                                            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-xl"
                                            key={product.id}
                                        >
                                            <Link to={`/product/${product.id}`} className="block">
                                                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />

                                                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                                                        {product.isVerified && (
                                                            <span className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50/95 px-2 py-1 text-[10px] font-bold text-emerald-800 shadow-sm backdrop-blur">
                                                                <ShieldCheck size={12} /> Verified
                                                                Supplier
                                                            </span>
                                                        )}
                                                        {product.margin >= 40 && (
                                                            <span className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50/95 px-2 py-1 text-[10px] font-bold text-amber-800 shadow-sm backdrop-blur">
                                                                <TrendingUp size={12} /> High Margin
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-1 flex-col">
                                                    <div className="mb-1 flex items-start justify-between">
                                                        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                                            {product.category}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                                            <Clock size={10} /> Dispatches in{' '}
                                                            {product.dispatchDays}d
                                                        </span>
                                                    </div>

                                                    <h3 className="mb-1 line-clamp-2 text-sm leading-snug font-bold text-slate-900 transition-colors group-hover:text-slate-600">
                                                        {product.name}
                                                    </h3>

                                                    <div className="mb-3 flex items-center justify-between text-[10px] text-slate-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600 uppercase">
                                                                SKU: {product.skuId}
                                                            </span>
                                                            {product.stock > 0 &&
                                                                product.stock <= 50 && (
                                                                    <span className="font-bold text-red-500">
                                                                        Low Stock: {product.stock}
                                                                    </span>
                                                                )}
                                                        </div>
                                                        <span className="max-w-[45%] truncate font-medium">
                                                            By {product.vendor}
                                                        </span>
                                                    </div>

                                                    <div className="mb-3 grid grid-cols-3 gap-2 divide-x divide-slate-200 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                                                        <div className="pl-1">
                                                            <span className="mb-0.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                                MOQ
                                                            </span>
                                                            <span className="font-bold text-slate-900">
                                                                {product.moq} Units
                                                            </span>
                                                        </div>
                                                        <div className="pl-3">
                                                            <span className="mb-0.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                                GST
                                                            </span>
                                                            <span className="font-bold text-slate-900">
                                                                {product.gst}%
                                                            </span>
                                                        </div>
                                                        <div className="pl-3">
                                                            <span className="mb-0.5 block flex items-center gap-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                                <Percent size={10} /> Margin
                                                            </span>
                                                            <span className="font-bold text-emerald-600">
                                                                ~{product.margin}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto border-t border-slate-100 pt-4">
                                                        <div className="mb-4 flex items-end justify-between">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-slate-400 line-through">
                                                                    Retail MRP: ₹
                                                                    {product.originalPrice.toLocaleString(
                                                                        'en-IN'
                                                                    )}
                                                                </span>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-xl font-extrabold tracking-tight text-slate-900">
                                                                        ₹
                                                                        {product.price.toLocaleString(
                                                                            'en-IN'
                                                                        )}
                                                                    </span>
                                                                    <span className="text-xs font-medium text-slate-500">
                                                                        /unit
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-bold shadow-sm transition-all duration-300 ${isAdded ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/20' : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'}`}
                                                            onClick={(e) => handleAdd(product, e)}
                                                        >
                                                            {isAdded ? (
                                                                <>
                                                                    <Check size={16} /> Added Bulk
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ShoppingCart size={16} /> Quick
                                                                    Add (MOQ)
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>

                            {hasNextPage && (
                                <div className="mt-12 flex justify-center">
                                    <button
                                        className="rounded-full border border-slate-200 bg-white px-8 py-3 font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm disabled:opacity-50"
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                    >
                                        {isFetchingNextPage
                                            ? 'Loading Inventory...'
                                            : 'Load More Products'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

export default DropshipProducts;
