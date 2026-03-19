import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    Package,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    Truck,
    Shield,
    Minus,
    Plus,
} from 'lucide-react';
import api from '../utils/api';
import { useCartStore } from '../store/cartStore';
import LoadingScreen from './LoadingScreen';

const ProductPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart, isLoading: isCartLoading } = useCartStore();

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addToCartSuccess, setAddToCartSuccess] = useState(false);
    const [activeImage, setActiveImage] = useState(0); // For Image Gallery

    // B2B Order Intent State
    const [orderType, setOrderType] = useState('WHOLESALE');
    const [quantity, setQuantity] = useState(1);
    const [customSellingPrice, setCustomSellingPrice] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${productId}`);
                const data = res.data.data;
                setProduct(data);
                setQuantity(data.moq || 10);
                setCustomSellingPrice(data.suggestedRetailPrice || 0);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load product');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    if (isLoading) return <LoadingScreen />;
    if (error) return <div className="p-10 text-center font-bold text-red-500">{error}</div>;
    if (!product) return <div className="p-10 text-center">Product not found</div>;

    // --- Dynamic Pricing Logic ---
    let currentUnitCost = product.dropshipBasePrice;

    if (orderType === 'WHOLESALE' && product.tieredPricing?.length > 0) {
        const applicableTier = [...product.tieredPricing]
            .sort((a, b) => b.minQty - a.minQty)
            .find((tier) => quantity >= tier.minQty);
        if (applicableTier) currentUnitCost = applicableTier.pricePerUnit;
    }

    const estimatedTax = (currentUnitCost * product.gstSlab) / 100;
    const estimatedProfit =
        orderType === 'DROPSHIP'
            ? (customSellingPrice - (currentUnitCost + estimatedTax)) * quantity
            : 0;

    // --- Handlers ---
    const updateQuantity = (newQty) => {
        setAddToCartSuccess(false);
        if (newQty === '') {
            setQuantity('');
            return;
        }
        const parsed = Number(newQty);
        const minQty = product.moq || 1;
        const maxQty = product.inventory?.stock || 9999;

        if (parsed > maxQty) setQuantity(maxQty);
        else if (parsed < minQty) setQuantity(minQty);
        else setQuantity(parsed);
    };

    const handleAddToCart = async () => {
        setAddToCartSuccess(false);
        const finalQty = quantity === '' ? product.moq || 1 : quantity;

        const res = await addToCart(
            product._id,
            finalQty,
            orderType,
            orderType === 'DROPSHIP' ? customSellingPrice : 0
        );

        if (res.success) {
            setAddToCartSuccess(true);
            setTimeout(() => setAddToCartSuccess(false), 3000);
        }
    };

    return (
        <div className="mx-auto mb-20 max-w-7xl px-4 py-8 font-sans md:mb-0 md:py-12">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900"
            >
                &larr; Back to Catalog
            </button>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                {/* Left: Enhanced Image Gallery */}
                <div className="sticky top-24 h-fit space-y-4 lg:col-span-5">
                    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <img
                            src={
                                product.images?.[activeImage]?.url ||
                                'https://via.placeholder.com/600'
                            }
                            alt={product.title}
                            className="h-[400px] w-full object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                    {/* Thumbnail Strip */}
                    {product.images?.length > 1 && (
                        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${activeImage === idx ? 'border-indigo-600 shadow-md' : 'border-slate-200 hover:border-slate-400'}`}
                                >
                                    <img
                                        src={img.url}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Trust Badges */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-xs font-bold text-slate-600">
                            <Shield className="text-emerald-600" size={18} /> Verified B2B Supplier
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-xs font-bold text-slate-600">
                            <Truck className="text-indigo-600" size={18} /> Pan-India Dispatch
                        </div>
                    </div>
                </div>

                {/* Right: B2B Command Center */}
                <div className="flex flex-col space-y-6 lg:col-span-7">
                    <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
                                {product.categoryId?.name || 'Category'}
                            </span>
                            <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold tracking-wider text-emerald-700 uppercase">
                                <ShieldCheck size={14} /> GST: {product.gstSlab}% (ITC Available)
                            </span>
                        </div>
                        <h1 className="text-3xl leading-tight font-extrabold text-slate-900 md:text-4xl">
                            {product.title}
                        </h1>
                        <p className="mt-3 inline-block rounded-md bg-slate-100 px-2 py-1 font-mono text-sm font-medium text-slate-500">
                            SKU: {product.sku}
                        </p>
                    </div>

                    {/* Stock Indicator */}
                    <div>
                        {product.inventory?.stock > 0 ? (
                            <div className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                                <CheckCircle2 size={16} className="mr-2" /> In Stock & Ready to
                                Dispatch ({product.inventory.stock} units)
                            </div>
                        ) : (
                            <div className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
                                <AlertCircle size={16} className="mr-2" /> Out of Stock
                            </div>
                        )}
                    </div>

                    {/* Order Intent Toggle */}
                    <div className="flex rounded-2xl bg-slate-200/60 p-1.5">
                        <button
                            onClick={() => {
                                setOrderType('WHOLESALE');
                                setQuantity(Math.max(10, product.moq || 10));
                                setAddToCartSuccess(false);
                            }}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold transition-all ${orderType === 'WHOLESALE' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Package size={18} /> Bulk Buy
                        </button>
                        <button
                            onClick={() => {
                                setOrderType('DROPSHIP');
                                setQuantity(1);
                                setAddToCartSuccess(false);
                            }}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold transition-all ${orderType === 'DROPSHIP' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <TrendingUp size={18} /> Dropship
                        </button>
                    </div>

                    {/* WHOLESALE MODE UI */}
                    {orderType === 'WHOLESALE' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6">
                            <h3 className="flex items-center gap-2 font-extrabold text-indigo-950">
                                <ShoppingCart size={20} className="text-indigo-600" /> Factory
                                Volume Pricing
                            </h3>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {product.tieredPricing?.length > 0 ? (
                                    product.tieredPricing.map((tier, idx) => {
                                        const isApplicable =
                                            quantity >= tier.minQty &&
                                            (!tier.maxQty || quantity <= tier.maxQty);
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex flex-col justify-center rounded-2xl border p-4 transition-all ${isApplicable ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'border-indigo-100 bg-white text-slate-600'}`}
                                            >
                                                <span className="mb-1 text-xs font-bold opacity-90">
                                                    Buy {tier.minQty}
                                                    {tier.maxQty ? ` - ${tier.maxQty}` : '+'} units
                                                </span>
                                                <span className="text-2xl font-extrabold">
                                                    ₹{tier.pricePerUnit.toLocaleString('en-IN')}{' '}
                                                    <span className="text-sm font-medium opacity-75">
                                                        /ea
                                                    </span>
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col rounded-2xl border border-indigo-100 bg-white p-4 text-slate-600 sm:col-span-2">
                                        <span className="mb-1 text-xs font-bold opacity-80">
                                            Standard Wholesale (MOQ: {product.moq})
                                        </span>
                                        <span className="text-2xl font-extrabold text-slate-900">
                                            ₹{product.dropshipBasePrice?.toLocaleString('en-IN')}{' '}
                                            <span className="text-sm font-medium opacity-75">
                                                /ea
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-white p-4 sm:flex-row">
                                <div className="w-full sm:w-auto">
                                    <label className="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        Quantity
                                    </label>
                                    <div className="flex w-fit items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                                        <button
                                            onClick={() => updateQuantity((quantity || 0) - 1)}
                                            className="rounded-lg bg-white p-2 text-slate-500 shadow-sm hover:text-slate-900"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => updateQuantity(e.target.value)}
                                            onBlur={() => {
                                                if (quantity === '')
                                                    updateQuantity(product.moq || 1);
                                            }}
                                            className="hide-arrows w-16 bg-transparent text-center text-lg font-extrabold text-slate-900 outline-none"
                                        />
                                        <button
                                            onClick={() => updateQuantity((quantity || 0) + 1)}
                                            className="rounded-lg bg-white p-2 text-slate-500 shadow-sm hover:text-slate-900"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    {quantity < product.moq && (
                                        <p className="mt-1 text-[10px] font-bold text-red-500">
                                            Min. order: {product.moq}
                                        </p>
                                    )}
                                </div>
                                <div className="w-full border-t border-slate-100 pt-3 text-right sm:w-auto sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
                                    <span className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                                        Subtotal (Excl. GST)
                                    </span>
                                    <span className="text-3xl font-extrabold text-slate-900">
                                        ₹
                                        {(currentUnitCost * (quantity || 0)).toLocaleString(
                                            'en-IN'
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DROPSHIP MODE UI */}
                    {orderType === 'DROPSHIP' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-5 rounded-3xl border border-amber-100 bg-amber-50/50 p-6">
                            <h3 className="flex items-center gap-2 font-extrabold text-amber-950">
                                <TrendingUp size={20} className="text-amber-600" /> Reseller Margin
                                Configurator
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-amber-100 bg-white p-4">
                                    <p className="mb-1 text-xs font-bold text-slate-400 uppercase">
                                        Sourcing Cost (Inc. GST)
                                    </p>
                                    <p className="text-2xl font-extrabold text-slate-900">
                                        ₹
                                        {(product.dropshipBasePrice + estimatedTax).toLocaleString(
                                            'en-IN',
                                            { maximumFractionDigits: 0 }
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-amber-100 bg-white p-4">
                                    <p className="mb-1 text-xs font-bold text-slate-400 uppercase">
                                        Suggested Retail
                                    </p>
                                    <p className="text-2xl font-extrabold text-slate-900">
                                        ₹{product.suggestedRetailPrice?.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-amber-100 bg-white p-4">
                                <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                                    Set Your Customer's Price (₹)
                                </label>
                                <input
                                    type="number"
                                    value={customSellingPrice}
                                    onChange={(e) => setCustomSellingPrice(Number(e.target.value))}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xl font-extrabold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>

                            <div
                                className={`flex flex-col items-center justify-between rounded-2xl p-5 shadow-sm transition-all duration-300 sm:flex-row ${estimatedProfit > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-red-500 text-white'}`}
                            >
                                <span className="text-sm font-bold opacity-90">
                                    Net Margin (Your Profit):
                                </span>
                                <span className="text-3xl font-extrabold">
                                    ₹
                                    {estimatedProfit.toLocaleString('en-IN', {
                                        maximumFractionDigits: 0,
                                    })}
                                </span>
                            </div>
                            <p className="flex items-center justify-center gap-1 text-center text-xs font-bold text-amber-700/80">
                                <ShieldCheck size={14} /> Margins credit to Wallet 48hrs
                                post-delivery.
                            </p>
                        </div>
                    )}

                    {/* Desktop & Mobile Action Button */}
                    <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:relative lg:z-auto lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none">
                        <button
                            onClick={handleAddToCart}
                            disabled={
                                isCartLoading ||
                                product.inventory?.stock <= 0 ||
                                (orderType === 'WHOLESALE' && quantity < product.moq)
                            }
                            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-extrabold tracking-wide transition-all duration-300 ${
                                addToCartSuccess
                                    ? 'scale-[0.98] bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                                    : 'bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'
                            }`}
                        >
                            {isCartLoading ? (
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : addToCartSuccess ? (
                                <>
                                    <CheckCircle2 size={24} /> Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={20} />{' '}
                                    {orderType === 'WHOLESALE'
                                        ? 'Add Bulk Order to Cart'
                                        : 'Push to Dropship Queue'}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Info Tabs / Specs */}
                    <div className="border-t border-slate-100 pt-6">
                        <h4 className="mb-2 font-bold text-slate-900">Product Description</h4>
                        <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">
                            {product.description ||
                                'Premium quality materials sourced directly from verified manufacturers. Ideal for B2B procurement and high-margin retail reselling.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
