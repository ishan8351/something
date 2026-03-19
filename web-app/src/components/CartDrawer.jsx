import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X,
    Trash2,
    Package,
    ShoppingCart,
    TrendingUp,
    AlertCircle,
    FileText,
    Minus,
    Plus,
    ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';

const CartDrawer = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { cart, isLoading, fetchCart, updateCartItem, removeFromCart, getCartCount } =
        useCartStore();

    // Fetch the latest math from the backend whenever the drawer opens
    useEffect(() => {
        if (isOpen) fetchCart();
    }, [isOpen, fetchCart]);

    if (!isOpen) return null;

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    const hasDropshipItems = cart?.items?.some((i) => i.orderType === 'DROPSHIP');
    const hasWholesaleItems = cart?.items?.some((i) => i.orderType === 'WHOLESALE');

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose} // Clicking the backdrop closes the drawer
        >
            {/* Drawer Container - Fixed height using dvh for mobile browser chrome */}
            <div
                className="animate-in slide-in-from-right flex h-[100dvh] w-full max-w-md flex-col bg-white shadow-2xl duration-300"
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside drawer from closing it
            >
                {/* Header (Fixed) */}
                <div className="z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white p-6">
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                            <ShoppingCart size={22} className="text-slate-700" /> Procurement Cart
                        </h2>
                        <p className="mt-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                            {getCartCount()} {getCartCount() === 1 ? 'Unit' : 'Units'} Selected
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-900"
                        aria-label="Close cart"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cart Items List (Scrollable) */}
                <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
                    {isLoading && !cart ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-3 opacity-60">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
                            <p className="text-sm font-bold tracking-wider text-slate-500 uppercase">
                                Syncing Ledger...
                            </p>
                        </div>
                    ) : cart?.items?.length > 0 ? (
                        cart.items.map((item, idx) => (
                            <div
                                key={idx}
                                className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                            >
                                {/* Order Type Badge */}
                                <div className="absolute -top-3 left-4">
                                    {item.orderType === 'DROPSHIP' ? (
                                        <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-[10px] font-extrabold tracking-widest text-amber-800 uppercase shadow-sm">
                                            <Package size={12} /> Dropship
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1 text-[10px] font-extrabold tracking-widest text-indigo-800 uppercase shadow-sm">
                                            <ShoppingCart size={12} /> Wholesale
                                        </span>
                                    )}
                                </div>

                                <div className="mt-3 flex gap-4">
                                    {/* Product Image */}
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                        <img
                                            src={
                                                item.productId?.images?.[0]?.url ||
                                                'https://via.placeholder.com/80'
                                            }
                                            alt={item.productId?.title}
                                            className="h-full w-full object-cover mix-blend-multiply"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate pr-2 text-sm font-bold text-slate-900">
                                            {item.productId?.title || 'Unknown Product'}
                                        </h3>
                                        <p className="mt-0.5 font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            SKU: {item.productId?.sku}
                                        </p>

                                        {/* Financial Breakdown */}
                                        <div className="mt-2 space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-500">
                                                    Unit Cost:
                                                </span>
                                                <span className="text-sm font-extrabold text-slate-900">
                                                    ₹
                                                    {item.platformUnitCost?.toLocaleString('en-IN')}
                                                </span>
                                            </div>

                                            {item.orderType === 'DROPSHIP' && (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-slate-500">
                                                            Selling At:
                                                        </span>
                                                        <span className="text-xs font-extrabold text-slate-900">
                                                            ₹
                                                            {item.resellerSellingPrice?.toLocaleString(
                                                                'en-IN'
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-1">
                                                        <span className="flex items-center gap-1 text-[10px] font-extrabold tracking-wider text-emerald-600 uppercase">
                                                            <TrendingUp size={12} /> Margin
                                                        </span>
                                                        <span className="text-sm font-black text-emerald-600">
                                                            ₹
                                                            {item.expectedProfit?.toLocaleString(
                                                                'en-IN'
                                                            )}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Quantity & Actions */}
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm">
                                                <button
                                                    onClick={() =>
                                                        updateCartItem(
                                                            item.productId?._id,
                                                            item.qty - 1
                                                        )
                                                    }
                                                    disabled={
                                                        item.qty <=
                                                            (item.orderType === 'WHOLESALE'
                                                                ? item.productId?.moq
                                                                : 1) || isLoading
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-l-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="flex h-8 w-10 items-center justify-center border-x border-slate-100 text-center text-sm font-extrabold text-slate-900">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateCartItem(
                                                            item.productId?._id,
                                                            item.qty + 1
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                    className="flex h-8 w-8 items-center justify-center rounded-r-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.productId?._id)}
                                                className="rounded-lg bg-red-50 p-2 text-red-400 opacity-70 transition-colors group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                                                title="Remove Item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 px-6 text-center">
                            <div className="mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                                <ShoppingCart size={40} className="text-slate-300" />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900">
                                    Your Cart is Empty
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed font-medium text-slate-500">
                                    Browse our B2B catalog to add wholesale items or queue dropship
                                    products for your customers.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-slate-900/20 transition-colors hover:bg-slate-800"
                            >
                                Browse Catalog
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer / Checkout Summary (Fixed at bottom) */}
                {cart?.items?.length > 0 && (
                    <div className="z-10 shrink-0 border-t border-slate-200 bg-white p-6 pb-8 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)] sm:pb-6">
                        <div className="mb-5 space-y-3 text-sm">
                            <div className="flex justify-between font-bold text-slate-500">
                                <span>Taxable Amount</span>
                                <span className="text-slate-900">
                                    ₹
                                    {cart.subTotalPlatformCost?.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                            <div className="-mx-2 flex items-center justify-between rounded-md bg-emerald-50 px-2 py-1 font-bold text-emerald-700">
                                <span className="flex items-center gap-1.5">
                                    <ShieldCheck size={16} /> Estimated GST (ITC Available)
                                </span>
                                <span>
                                    + ₹
                                    {cart.totalTax?.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>

                            <div className="my-4 h-px w-full bg-slate-200"></div>

                            {/* What they actually pay */}
                            <div className="flex items-center justify-between">
                                <span className="text-base font-extrabold text-slate-900">
                                    Total Payable
                                </span>
                                <span className="text-2xl font-black tracking-tight text-slate-900">
                                    ₹
                                    {cart.grandTotalPlatformCost?.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>

                            {/* The Gamification element - Total Expected Profit */}
                            {cart.totalExpectedProfit > 0 && (
                                <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white shadow-sm transition-all hover:scale-[1.02]">
                                    <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider uppercase">
                                        <TrendingUp size={18} />
                                        Expected Margin
                                    </div>
                                    <span className="text-2xl font-black">
                                        +₹
                                        {cart.totalExpectedProfit?.toLocaleString('en-IN', {
                                            maximumFractionDigits: 0,
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Order Mix Warnings */}
                        {hasDropshipItems && hasWholesaleItems && (
                            <div className="mb-4 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-[10px] font-bold text-indigo-700">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <p>
                                    Mixed Order: You will need to provide separate shipping
                                    addresses for your Dropship items during checkout.
                                </p>
                            </div>
                        )}
                        {hasDropshipItems && !hasWholesaleItems && (
                            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-[10px] font-bold text-amber-700">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <p>
                                    Dropship Order: Have your customer's shipping details ready for
                                    checkout.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleCheckout}
                            disabled={isLoading}
                            className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-extrabold tracking-widest text-white uppercase transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
