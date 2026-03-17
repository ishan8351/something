import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';
import { productApi } from '../features/products/api/productApi.js';
import { CartContext } from '../CartContext.jsx';
import { WishlistContext } from '../WishlistContext.jsx';
import {
    ShieldCheck,
    Truck,
    Building2,
    Package,
    FileText,
    Heart,
    AlertCircle,
    TrendingUp,
    Percent,
} from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BeautifulDescription from './BeautifulDescription';
import Footer from './Footer';

function ProductPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems } = useContext(CartContext);
    const { isInWishlist, toggleWishlist } = useContext(WishlistContext);

    const { data: p } = useSuspenseQuery({
        queryKey: ['product', productId],
        queryFn: () => productApi.getProductById(productId),
    });

    const [selectedImage, setSelectedImage] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const product = React.useMemo(() => {
        if (!p) return null;

        const basePrice = p.platformSellPrice;
        const moq = p.moq || Math.floor(Math.random() * 50) + 10;
        const retailMrp = p.compareAtPrice || Math.floor(basePrice * 1.8);
        const estMargin = Math.round(((retailMrp - basePrice) / retailMrp) * 100);

        return {
            id: p._id,
            skuId: p.sku || `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            name: p.title,
            category: p.categoryId?.name || p.productType || 'Wholesale Goods',

            supplierName: p.vendor || 'Premium Industries Pvt Ltd',
            isVerifiedSupplier: true,
            supplierRating: 4.8,
            supplierYears: Math.floor(Math.random() * 10) + 2,

            basePrice: basePrice,
            retailMrp: retailMrp,
            estMargin: estMargin,
            moq: moq,
            gstPercent: p.gstPercent || 18,
            hsnCode: p.hsn || '85437099',
            stock: p.inventory?.stock || Math.floor(Math.random() * 5000) + 500,

            tiers: [
                { min: moq, max: moq * 4, price: basePrice },
                { min: moq * 4 + 1, max: moq * 9, price: Math.floor(basePrice * 0.95) },
                { min: moq * 9 + 1, max: '1000+', price: Math.floor(basePrice * 0.88) },
            ],

            descriptionHTML: p.descriptionHTML || p.description || p.title,
            images:
                p.images?.length > 0
                    ? p.images.map((img) => img.url)
                    : ['https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&q=80'],
            rating: p.averageRating || 4.5,
            reviewCount: p.reviewCount || Math.floor(Math.random() * 50) + 5,
        };
    }, [p]);

    const [quantity, setQuantity] = useState(product?.moq || 1);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (product) {
            setQuantity(product.moq);
        }
    }, [productId, product]);

    const currentPrice = React.useMemo(() => {
        if (!product) return 0;
        let price = product.basePrice;
        for (const tier of product.tiers) {
            if (quantity >= tier.min) {
                price = tier.price;
            }
        }
        return price;
    }, [quantity, product]);

    const handleQuantityChange = (val) => {
        let newQty = Math.max(product.moq, val);
        newQty = Math.min(newQty, product.stock);
        setQuantity(newQty);
    };

    if (!product) return null;

    return (
        <div className="selection:bg-primary/30 flex min-h-screen flex-col bg-slate-50 pb-24 font-sans text-slate-900 lg:pb-0">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                {/* Breadcrumbs */}
                <nav className="mb-8 flex items-center gap-2 overflow-x-auto text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                    <Link to="/" className="hover:text-primary transition-colors">
                        Catalog
                    </Link>
                    <span>›</span>
                    <span className="hover:text-primary cursor-pointer transition-colors">
                        {product.category}
                    </span>
                    <span>›</span>
                    <span className="inline-block max-w-[200px] truncate text-slate-900">
                        {product.name}
                    </span>
                </nav>

                <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                    {/* Image Gallery */}
                    <div className="sticky top-28 flex h-fit flex-col-reverse gap-4 md:flex-row lg:col-span-5">
                        <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-2 md:flex-col md:overflow-y-auto md:pr-2 md:pb-0">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    className={`h-24 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${selectedImage === i ? 'border-primary shadow-md' : 'border-transparent hover:border-slate-300'}`}
                                    onClick={() => setSelectedImage(i)}
                                >
                                    <img
                                        src={img}
                                        alt={`View ${i + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="group relative flex aspect-square flex-1 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                            <img
                                src={product.images[selectedImage] || product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* Badges on Image */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {product.estMargin >= 40 && (
                                    <span className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-100/90 px-3 py-1.5 text-[11px] font-extrabold text-amber-800 shadow-sm backdrop-blur">
                                        <TrendingUp size={14} /> High Margin
                                    </span>
                                )}
                            </div>

                            <button
                                className={`absolute top-4 right-4 rounded-full border p-3 shadow-md transition-all duration-300 ${isInWishlist(product.id) ? 'bg-danger border-danger text-white' : 'hover:text-danger border-slate-200 bg-white/90 text-slate-400 backdrop-blur hover:scale-110'}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleWishlist({ id: product.id, ...product });
                                }}
                            >
                                <Heart
                                    size={20}
                                    fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Product Details & Purchasing */}
                    <div className="flex flex-col lg:col-span-7">
                        {/* Header & Supplier Info */}
                        <div className="mb-6">
                            <h1 className="mb-4 text-3xl leading-tight font-extrabold tracking-tight text-slate-900 md:text-4xl">
                                {product.name}
                            </h1>

                            <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                                <div className="flex items-center gap-2">
                                    <Building2 size={18} className="text-blue-600" />
                                    <span className="text-sm font-bold text-slate-900">
                                        {product.supplierName}
                                    </span>
                                </div>
                                {product.isVerifiedSupplier && (
                                    <span className="flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-[10px] font-bold tracking-wider text-green-700 uppercase">
                                        <ShieldCheck size={12} /> Verified Supplier
                                    </span>
                                )}
                                <span className="border-l border-slate-300 pl-4 text-xs font-medium text-slate-500">
                                    {product.supplierYears} Yrs on Platform
                                </span>
                            </div>

                            <div className="mb-6 flex items-center gap-6 border-b border-slate-200 pb-6 text-sm">
                                <span className="font-medium text-slate-500">
                                    SKU:{' '}
                                    <span className="font-bold text-slate-900">
                                        {product.skuId}
                                    </span>
                                </span>
                                <span className="font-medium text-slate-500">
                                    HSN:{' '}
                                    <span className="font-bold text-slate-900">
                                        {product.hsnCode}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Retail Metrics & Pricing */}
                        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <h3 className="mb-1 flex items-center gap-2 text-sm font-bold tracking-wider text-slate-900 uppercase">
                                        <Package size={16} /> Wholesale Pricing
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Retail MRP:{' '}
                                        <span className="line-through">
                                            ₹{product.retailMrp.toLocaleString('en-IN')}
                                        </span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="mb-1 flex items-center justify-end gap-1 text-xs font-bold tracking-wider text-emerald-600 uppercase">
                                        <Percent size={12} /> Est. Retail Margin
                                    </span>
                                    <span className="text-xl font-extrabold text-emerald-600">
                                        ~{product.estMargin}%
                                    </span>
                                </div>
                            </div>

                            {/* Dynamic Tiered Boxes */}
                            <div className="mb-6 grid grid-cols-3 gap-3 text-center">
                                {product.tiers.map((tier, index) => {
                                    // Check if this tier is the currently active one based on selected quantity
                                    const isMaxTier = tier.max === '1000+';
                                    const isActive =
                                        quantity >= tier.min && (isMaxTier || quantity <= tier.max);

                                    return (
                                        <div
                                            key={index}
                                            className={`rounded-xl border p-3 transition-all duration-300 ${isActive ? 'bg-primary/5 border-primary scale-[1.02] shadow-sm' : 'border-transparent bg-slate-50 opacity-70'}`}
                                        >
                                            <span
                                                className={`mb-1 block text-xl font-extrabold ${isActive ? 'text-primary' : 'text-slate-900'}`}
                                            >
                                                ₹{tier.price.toLocaleString('en-IN')}
                                            </span>
                                            <span
                                                className={`block text-[11px] font-bold ${isActive ? 'text-primary' : 'text-slate-500'}`}
                                            >
                                                {tier.min} {isMaxTier ? '+' : `- ${tier.max}`} units
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Subtotal Calculation */}
                            <div className="flex items-center justify-between rounded-lg border-t border-slate-100 bg-slate-50/50 px-4 py-4">
                                <div>
                                    <span className="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                                        Total Excl. GST
                                    </span>
                                    <span className="text-3xl font-extrabold tracking-tighter text-slate-900">
                                        ₹{(currentPrice * quantity).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="mb-1 flex items-center justify-end gap-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                        <FileText size={12} /> {product.gstPercent}% GST (ITC
                                        Claimable)
                                    </span>
                                    <span className="text-lg font-bold text-slate-600">
                                        + ₹
                                        {(
                                            currentPrice *
                                            quantity *
                                            (product.gstPercent / 100)
                                        ).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Procurement Controls */}
                        <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                            <div className="flex flex-col items-end gap-6 sm:flex-row">
                                <div className="w-full flex-1">
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-900">
                                            Procurement Quantity
                                        </label>
                                        <span className="text-xs font-medium text-slate-500">
                                            Stock: {product.stock.toLocaleString('en-IN')} units
                                        </span>
                                    </div>
                                    <div className="focus-within:border-primary focus-within:ring-primary flex h-14 items-center overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:ring-1">
                                        <button
                                            className="flex h-full w-14 items-center justify-center bg-slate-100 font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
                                            onClick={() =>
                                                handleQuantityChange(quantity - product.moq)
                                            }
                                            disabled={quantity <= product.moq}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            className="h-full w-full flex-1 bg-transparent text-center text-lg font-extrabold text-slate-900 outline-none"
                                            value={quantity}
                                            onChange={(e) =>
                                                handleQuantityChange(
                                                    parseInt(e.target.value) || product.moq
                                                )
                                            }
                                            onBlur={(e) => {
                                                let val = parseInt(e.target.value);
                                                if (isNaN(val) || val < product.moq) {
                                                    setQuantity(product.moq);
                                                } else {
                                                    // Forces into multiples of MOQ
                                                    const remainder = val % product.moq;
                                                    if (remainder !== 0) {
                                                        setQuantity(val - remainder);
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            className="flex h-full w-14 items-center justify-center bg-slate-100 font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
                                            onClick={() =>
                                                handleQuantityChange(quantity + product.moq)
                                            }
                                            disabled={quantity >= product.stock}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="text-[11px] font-bold text-slate-500">
                                            Sold in multiples of {product.moq}
                                        </p>
                                        {quantity === product.moq && (
                                            <p className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                                                <AlertCircle size={12} /> MOQ is {product.moq}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="hidden w-full flex-1 sm:block">
                                    <button
                                        className="bg-primary hover:bg-primary-light hover:shadow-primary/30 flex h-14 w-full items-center justify-center gap-2 rounded-xl font-bold tracking-wide text-white transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300"
                                        disabled={product.stock < product.moq}
                                        onClick={() => {
                                            if (product.stock < product.moq) return;
                                            let safeImage =
                                                product.images[0] ||
                                                'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&q=80';
                                            addToCart(
                                                {
                                                    _id: product.id,
                                                    id: product.id,
                                                    name: product.name,
                                                    price: currentPrice,
                                                    image: safeImage,
                                                    sku: product.skuId,
                                                    minQuantity: product.moq,
                                                },
                                                quantity
                                            );

                                            alert(`Added ${quantity} units to Procurement Cart`);
                                        }}
                                    >
                                        <Package size={20} /> Add to Bulk Order
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Logistics info */}
                        <div className="mt-auto space-y-0 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-start gap-4 p-5">
                                <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">
                                        Pan-India Freight Logistics
                                    </h4>
                                    <p className="text-sm font-medium text-slate-500">
                                        Dispatches within 48 hours. LTL and FTL logistics available
                                        for heavy loads.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-5">
                                <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">
                                        GST Input Tax Credit
                                    </h4>
                                    <p className="text-sm font-medium text-slate-500">
                                        100% compliant B2B invoicing provided to claim ITC. Ensure
                                        your GSTIN is updated in your profile.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Specs */}
                <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
                    <h2 className="mb-6 text-2xl font-extrabold text-slate-900">
                        Product Specifications
                    </h2>
                    <div className="prose prose-slate max-w-none">
                        <BeautifulDescription rawHtml={product.descriptionHTML} />
                    </div>
                </section>
            </main>
            <Footer />

            {/* Sticky Mobile Buy Bar */}
            <div className="pb-safe fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 bg-white p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:hidden">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-slate-900">
                        ₹{(currentPrice * quantity).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{quantity} units</span>
                </div>
                <button
                    className="bg-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold tracking-wide text-white transition-all disabled:bg-slate-300"
                    disabled={product.stock < product.moq}
                    onClick={() => {
                        if (product.stock < product.moq) return;
                        let safeImage =
                            product.images[0] ||
                            'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&q=80';
                        addToCart(
                            {
                                ...product,
                                _id: product.id,
                                id: product.id,
                                name: product.name,
                                price: currentPrice,
                                image: safeImage,
                                sku: product.skuId,
                                minQuantity: product.moq,
                            },
                            quantity
                        );
                        alert(`Added ${quantity} units to Procurement Cart`);
                    }}
                >
                    <Package size={18} /> Add to Bulk Order
                </button>
            </div>
        </div>
    );
}

export default ProductPage;
