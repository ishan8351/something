import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
    Check,
    ChevronDown,
    X,
    ShieldCheck,
    Box,
    Clock,
    ShoppingCart,
    LayoutGrid,
    List as ListIcon,
    Receipt,
    Truck,
} from 'lucide-react';
import api from '../utils/api.js';
import { useCartStore } from '../store/cartStore';

const SORT_OPTIONS = [
    { value: 'default', label: 'Recommended' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'margin', label: 'Highest Margin' },
];

function DropshipProducts({
    filters = {},
    globalSearchQuery = '',
    initialCategory = 'All Categories',
}) {
    const addToCart = useCartStore((state) => state.addToCart);

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState('list');

    // --- ADVANCED FILTER STATE ---
    const [category, setCategory] = useState('All Categories');
    const [sort, setSort] = useState('default');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedGst, setSelectedGst] = useState([]); // Array of GST percentages
    const [maxDispatchDays, setMaxDispatchDays] = useState(''); // 1, 3, or 7
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    const [addedIds, setAddedIds] = useState([]);

    // Parent quick filters (from B2BFilterBar)
    const [b2bFilters, setB2bFilters] = useState({
        moq: filters.moq || 'all',
        margin: filters.margin || 0,
        readyToShip: filters.readyToShip || false,
        lowRtoRisk: filters.lowRtoRisk || false,
    });

    useEffect(() => {
        setB2bFilters({
            moq: filters.moq || 'all',
            margin: filters.margin || 0,
            readyToShip: filters.readyToShip || false,
            lowRtoRisk: filters.lowRtoRisk || false,
        });
    }, [filters]);

    useEffect(() => {
        if (initialCategory) setCategory(initialCategory);
    }, [initialCategory]);

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
            resetAdvancedFilters();
        }
    }, [globalSearchQuery]);

    // --- API CALL & QUERY BUILDER ---
    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
        queryKey: [
            'products',
            selectedCatId,
            sort,
            minPrice,
            maxPrice,
            selectedGst,
            maxDispatchDays,
            verifiedOnly,
            b2bFilters,
            globalSearchQuery,
        ],
        queryFn: async ({ pageParam = 1 }) => {
            const params = new URLSearchParams({ page: pageParam, limit: 30 });

            if (selectedCatId) params.append('category', selectedCatId);
            if (globalSearchQuery) params.append('search', globalSearchQuery);
            if (sort !== 'default') params.append('sort', sort);
            if (minPrice) params.append('minBasePrice', minPrice);
            if (maxPrice) params.append('maxBasePrice', maxPrice);

            // NEW: B2B Sidebar Filters mapping
            if (selectedGst.length > 0) params.append('gstSlab', selectedGst.join(','));
            if (maxDispatchDays) params.append('maxShippingDays', maxDispatchDays);
            if (verifiedOnly) params.append('isVerifiedSupplier', 'true');

            // Quick Filters mapping
            if (b2bFilters.margin && b2bFilters.margin > 0)
                params.append('minMargin', b2bFilters.margin.toString());
            if (b2bFilters.moq === 'under-50') params.append('maxMoq', '50');
            else if (b2bFilters.moq === '50-500') {
                params.append('minMoq', '50');
                params.append('maxMoq', '500');
            } else if (b2bFilters.moq === 'bulk') params.append('minMoq', '500');

            if (b2bFilters.readyToShip) params.append('inStock', 'true');
            if (b2bFilters.lowRtoRisk) params.append('lowRtoRisk', 'true');

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
                    image:
                        p.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=200&q=80',
                    moq: p.moq || 10,
                    gst: p.gstSlab || 18,
                    isVerified: p.isVerifiedSupplier !== false,
                    rtoRate: p.historicalRtoRate || 0,
                    dispatchDays: p.shippingDays || 2,
                };
            });
    }, [data]);

    const resetAdvancedFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setSelectedGst([]);
        setMaxDispatchDays('');
        setVerifiedOnly(false);
    };

    const resetAll = () => {
        setCategory('All Categories');
        setSort('default');
        resetAdvancedFilters();
    };

    const handleAdd = async (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        setAddedIds((prev) => [...prev, product.id]);
        await addToCart(product.id, product.moq, 'WHOLESALE', 0);
        setTimeout(() => setAddedIds((prev) => prev.filter((x) => x !== product.id)), 1800);
    };

    const toggleGst = (slab) => {
        setSelectedGst((prev) =>
            prev.includes(slab) ? prev.filter((g) => g !== slab) : [...prev, slab]
        );
    };

    return (
        <section className="relative z-10 w-full pt-4">
            {/* Utility Bar */}
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <button
                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm md:hidden"
                    onClick={() => setIsMobileFilterOpen(true)}
                >
                    Filters
                </button>

                <div className="flex w-full items-center justify-between md:w-auto md:justify-end md:gap-4">
                    <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1 shadow-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`rounded px-2 py-1.5 transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
                            title="List View"
                        >
                            <ListIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`rounded px-2 py-1.5 transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm focus-within:ring-1 focus-within:ring-slate-400">
                        <span className="text-xs font-bold text-slate-400 uppercase">Sort:</span>
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

            <div className="flex flex-col items-start gap-6 md:flex-row">
                {/* ADVANCED FILTERS SIDEBAR */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 md:sticky md:top-40 md:z-0 md:h-fit md:w-64 md:translate-x-0 md:rounded-xl md:border md:border-slate-200 md:p-5 md:shadow-none ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase">Refine</h3>
                        <div className="flex items-center gap-2">
                            <button
                                className="text-[10px] font-bold text-slate-500 hover:text-slate-900"
                                onClick={resetAll}
                            >
                                CLEAR
                            </button>
                            <button
                                className="p-1 text-slate-400 md:hidden"
                                onClick={() => setIsMobileFilterOpen(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Categories */}
                        <div className="space-y-2">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                                <Box size={14} /> Category
                            </h4>
                            <div className="custom-scrollbar max-h-40 space-y-1 overflow-y-auto pr-1">
                                {[{ _id: 'All', name: 'All Categories' }, ...dbCategories].map(
                                    (cat) => (
                                        <label
                                            key={cat._id || cat.name}
                                            className="flex cursor-pointer items-center gap-2 py-1"
                                        >
                                            <input
                                                type="radio"
                                                className="h-3 w-3 accent-slate-900"
                                                checked={category === cat.name}
                                                onChange={() => setCategory(cat.name)}
                                            />
                                            <span
                                                className={`text-xs font-semibold ${category === cat.name ? 'text-slate-900' : 'text-slate-600'}`}
                                            >
                                                {cat.name}
                                            </span>
                                        </label>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2 border-t border-slate-100 pt-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase">
                                Unit Price (₹)
                            </h4>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs font-semibold outline-none focus:border-slate-500"
                                />
                                <span className="text-slate-300">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs font-semibold outline-none focus:border-slate-500"
                                />
                            </div>
                        </div>

                        {/* NEW: GST Slab */}
                        <div className="space-y-2 border-t border-slate-100 pt-4">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                                <Receipt size={14} /> GST Slab
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {[5, 12, 18, 28].map((slab) => (
                                    <label
                                        key={slab}
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <input
                                            type="checkbox"
                                            className="h-3 w-3 rounded border-slate-300 accent-slate-900"
                                            checked={selectedGst.includes(slab)}
                                            onChange={() => toggleGst(slab)}
                                        />
                                        <span className="text-xs font-semibold text-slate-700">
                                            {slab}%
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* NEW: Dispatch Time */}
                        <div className="space-y-2 border-t border-slate-100 pt-4">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                                <Truck size={14} /> Dispatch Time
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { val: '1', label: '< 24 Hrs' },
                                    { val: '3', label: '< 3 Days' },
                                    { val: '7', label: '< 7 Days' },
                                ].map((time) => (
                                    <button
                                        key={time.val}
                                        onClick={() =>
                                            setMaxDispatchDays(
                                                maxDispatchDays === time.val ? '' : time.val
                                            )
                                        }
                                        className={`rounded border px-2 py-1 text-[10px] font-bold transition-colors ${maxDispatchDays === time.val ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}`}
                                    >
                                        {time.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* NEW: Verified Supplier Toggle */}
                        <div className="border-t border-slate-100 pt-4">
                            <label className="flex cursor-pointer items-center justify-between">
                                <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <ShieldCheck size={14} className="text-blue-600" /> Verified
                                    Only
                                </span>
                                <div
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${verifiedOnly ? 'bg-blue-600' : 'bg-slate-200'}`}
                                >
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={verifiedOnly}
                                        onChange={() => setVerifiedOnly(!verifiedOnly)}
                                    />
                                    <span
                                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${verifiedOnly ? 'translate-x-5' : 'translate-x-1'}`}
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* MAIN PRODUCT AREA */}
                <div className="w-full flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-20 font-bold text-slate-400">
                            Loading Inventory...
                        </div>
                    ) : displayProducts.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
                            <p className="font-medium text-slate-500">
                                No inventory matches your current filters.
                            </p>
                            <button
                                onClick={resetAll}
                                className="mt-4 text-sm font-bold text-emerald-600 hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div
                            className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-2 gap-4 xl:grid-cols-4'
                                    : 'flex flex-col gap-3'
                            }
                        >
                            {displayProducts.map((product) => {
                                const isAdded = addedIds.includes(product.id);

                                // LIST VIEW
                                if (viewMode === 'list') {
                                    return (
                                        <Link
                                            to={`/product/${product.id}`}
                                            key={product.id}
                                            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                                        >
                                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="flex flex-1 flex-col justify-center overflow-hidden">
                                                <h3 className="truncate text-sm font-extrabold text-slate-900">
                                                    {product.name}
                                                </h3>
                                                <div className="mt-1 flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                                    <span className="font-mono text-slate-700">
                                                        SKU: {product.skuId}
                                                    </span>
                                                    <span>By: {product.vendor}</span>
                                                    <span className="flex items-center gap-0.5 text-slate-400">
                                                        <Clock size={10} /> {product.dispatchDays}d
                                                        dispatch
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="hidden flex-col items-center justify-center border-l border-slate-100 px-4 md:flex">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    Margin
                                                </span>
                                                <span className="text-sm font-extrabold text-emerald-600">
                                                    {product.margin}%
                                                </span>
                                            </div>

                                            <div className="hidden flex-col items-center justify-center border-l border-slate-100 px-4 md:flex">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    GST
                                                </span>
                                                <span className="text-sm font-extrabold text-slate-600">
                                                    {product.gst}%
                                                </span>
                                            </div>

                                            <div className="hidden flex-col items-center justify-center border-l border-slate-100 px-4 md:flex">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    MOQ
                                                </span>
                                                <span className="text-sm font-extrabold text-slate-900">
                                                    {product.moq}
                                                </span>
                                            </div>

                                            <div className="flex flex-col items-end justify-center border-l border-slate-100 pr-2 pl-4">
                                                <span className="text-[10px] font-bold text-slate-400 line-through">
                                                    MRP: ₹{product.originalPrice}
                                                </span>
                                                <span className="text-lg font-extrabold text-slate-900">
                                                    ₹{product.price.toLocaleString('en-IN')}
                                                </span>
                                            </div>

                                            <button
                                                onClick={(e) => handleAdd(product, e)}
                                                className={`ml-2 flex h-10 w-24 flex-shrink-0 items-center justify-center gap-1 rounded-lg text-xs font-bold transition-all ${isAdded ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white'}`}
                                            >
                                                {isAdded ? (
                                                    <>
                                                        <Check size={14} /> Added
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart size={14} /> Add
                                                    </>
                                                )}
                                            </button>
                                        </Link>
                                    );
                                }

                                // GRID VIEW
                                return (
                                    <Link
                                        to={`/product/${product.id}`}
                                        key={product.id}
                                        className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-lg"
                                    >
                                        <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-slate-50">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                {product.margin >= 40 && (
                                                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                                                        High Margin
                                                    </span>
                                                )}
                                                {product.stock > 0 && product.stock <= 50 && (
                                                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-800">
                                                        Low Stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-1 flex-col">
                                            <span className="mb-0.5 text-[9px] font-bold text-slate-400">
                                                SKU: {product.skuId}
                                            </span>
                                            <h3 className="mb-2 line-clamp-2 text-xs leading-tight font-extrabold text-slate-900">
                                                {product.name}
                                            </h3>

                                            <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-2">
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 line-through">
                                                        MRP: ₹{product.originalPrice}
                                                    </span>
                                                    <span className="text-sm font-extrabold text-slate-900">
                                                        ₹{product.price.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-[9px] font-bold text-emerald-600">
                                                        {product.margin}% Mgn | {product.gst}% GST
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-500">
                                                        MOQ: {product.moq}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => handleAdd(product, e)}
                                                className={`mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition-all ${isAdded ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white'}`}
                                            >
                                                {isAdded ? 'Added to Cart' : 'Quick Add'}
                                            </button>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {hasNextPage && (
                        <div className="mt-8 flex justify-center">
                            <button
                                className="rounded-lg border border-slate-300 bg-white px-6 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? 'Loading...' : 'Load More Products'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default DropshipProducts;
