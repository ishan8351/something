import React, { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    X,
    Trash2,
    Package,
    ShoppingCart,
    TrendingUp,
    AlertCircle,
    Minus,
    Plus,
    ShieldCheck,
    CheckCircle,
    Lock,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { AuthContext } from '../AuthContext';

// Helper to determine if adding more units unlocks a better price
const getTierNudge = (currentQty, tieredPricing) => {
    if (!tieredPricing || tieredPricing.length === 0) return null;
    const sortedTiers = [...tieredPricing].sort((a, b) => a.minQty - b.minQty);
    const nextTier = sortedTiers.find((tier) => tier.minQty > currentQty);
    if (nextTier) {
        return {
            unitsNeeded: nextTier.minQty - currentQty,
            newPrice: nextTier.pricePerUnit,
            targetQty: nextTier.minQty,
        };
    }
    return null;
};

const CartDrawer = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    // Notice: I changed 'cart.items.reduce(..., item.qty)' inside cartStore to 'item.quantity'
    // but your drawer uses 'item.qty'. Let's stick to whatever your backend returns.
    // Assuming backend returns 'qty'.
    const { cart, isLoading, fetchCart, updateCartItem, removeFromCart, getCartCount } =
        useCartStore();
    const { user, isKycApproved } = useContext(AuthContext);

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
    const isB2BPending = user?.accountType === 'B2B' && !isKycApproved;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* High-Performance Overlay (No Blur) */}
            <div
                className="absolute inset-0 bg-slate-900/40 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* The Drawer */}
            <div
                className="relative flex h-[100dvh] w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                            <ShoppingCart size={20} className="text-slate-700" /> Procurement Cart
                        </h2>
                        <p className="mt-0.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                            {getCartCount()} {getCartCount() === 1 ? 'Unit' : 'Units'} Selected
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Cart Items (High Density) */}
                <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
                    {isLoading && !cart ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-3 text-slate-400">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
                            <p className="text-xs font-bold tracking-wider uppercase">
                                Syncing Ledger...
                            </p>
                        </div>
                    ) : cart?.items?.length > 0 ? (
                        cart.items.map((item, idx) => {
                            const nudge = getTierNudge(item.qty, item.productId?.tieredPricing);
                            const isDropship = item.orderType === 'DROPSHIP';

                            return (
                                <div
                                    key={idx}
                                    className="relative flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm"
                                >
                                    {/* Item Header / Top Row */}
                                    <div className="flex gap-3 p-3">
                                        {/* Thumbnail */}
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                                            <img
                                                src={
                                                    item.productId?.images?.[0]?.url ||
                                                    'https://via.placeholder.com/80'
                                                }
                                                alt={item.productId?.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {/* Main Info */}
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <h3 className="line-clamp-1 pr-2 text-xs font-extrabold text-slate-900">
                                                        {item.productId?.title || 'Unknown Product'}
                                                    </h3>
                                                    <button
                                                        onClick={() =>
                                                            removeFromCart(item.productId?._id)
                                                        }
                                                        className="text-slate-300 transition-colors hover:text-red-500"
                                                        title="Remove Item"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <p className="font-mono text-[9px] font-bold tracking-wider text-slate-400">
                                                    SKU: {item.productId?.sku}
                                                </p>
                                            </div>

                                            {/* Type Badge & Price */}
                                            <div className="flex items-end justify-between">
                                                {isDropship ? (
                                                    <span className="flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-800 uppercase">
                                                        <Package size={10} /> Dropship
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-indigo-800 uppercase">
                                                        <ShoppingCart size={10} /> Bulk
                                                    </span>
                                                )}
                                                <span className="text-sm font-extrabold text-slate-900">
                                                    ₹
                                                    {item.platformUnitCost?.toLocaleString('en-IN')}{' '}
                                                    <span className="text-[10px] font-medium text-slate-400">
                                                        /ea
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Row / Bottom Section */}
                                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-3 py-2">
                                        {/* Quantity Stepper */}
                                        <div className="flex items-center rounded-md border border-slate-200 bg-white">
                                            <button
                                                onClick={() =>
                                                    updateCartItem(
                                                        item.productId?._id,
                                                        item.qty - 1
                                                    )
                                                }
                                                disabled={
                                                    item.qty <=
                                                        (isDropship ? 1 : item.productId?.moq) ||
                                                    isLoading
                                                }
                                                className="flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="flex w-8 items-center justify-center border-x border-slate-100 text-xs font-extrabold text-slate-900">
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
                                                className="flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>

                                        {/* Total / Margin display */}
                                        <div className="text-right">
                                            {isDropship ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                        Margin:
                                                    </span>
                                                    <span className="text-xs font-black text-emerald-600">
                                                        +₹
                                                        {item.expectedProfit?.toLocaleString(
                                                            'en-IN'
                                                        )}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-black text-slate-900">
                                                    ₹
                                                    {(
                                                        item.platformUnitCost * item.qty
                                                    ).toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bulk Discount Nudges */}
                                    {!isDropship && nudge && (
                                        <div className="flex items-center justify-between bg-emerald-50 px-3 py-2">
                                            <p className="text-[10px] font-medium text-emerald-800">
                                                Add{' '}
                                                <span className="font-extrabold">
                                                    {nudge.unitsNeeded}
                                                </span>{' '}
                                                more for{' '}
                                                <span className="font-extrabold">
                                                    ₹{nudge.newPrice}/ea
                                                </span>
                                            </p>
                                            <button
                                                onClick={() =>
                                                    updateCartItem(
                                                        item.productId?._id,
                                                        nudge.targetQty
                                                    )
                                                }
                                                className="text-[10px] font-extrabold text-emerald-600 hover:underline"
                                            >
                                                Upgrade to {nudge.targetQty}
                                            </button>
                                        </div>
                                    )}
                                    {!isDropship &&
                                        !nudge &&
                                        item.productId?.tieredPricing?.length > 0 && (
                                            <div className="flex items-center gap-1 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
                                                <CheckCircle size={12} /> Max bulk discount active
                                            </div>
                                        )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/50">
                                <Package size={28} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-900">Cart is Empty</h3>
                            <p className="mt-1 px-6 text-xs font-medium text-slate-500">
                                Add wholesale inventory or queue dropship orders.
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-6 rounded-lg bg-slate-900 px-6 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-slate-800"
                            >
                                Browse Catalog
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer / Summary */}
                {cart?.items?.length > 0 && (
                    <div className="shrink-0 border-t border-slate-200 bg-white p-5 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                        {/* Summary Block */}
                        <div className="mb-4 space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Taxable Subtotal</span>
                                <span>
                                    ₹
                                    {cart.subTotalPlatformCost?.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
                                <span className="flex items-center gap-1">
                                    <ShieldCheck size={14} /> Est. GST (ITC Claimable)
                                </span>
                                <span>
                                    + ₹
                                    {cart.totalTax?.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                            <div className="my-3 border-t border-dashed border-slate-200" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-extrabold text-slate-900">
                                    Total Payable
                                </span>
                                <span className="text-xl font-black text-slate-900">
                                    ₹
                                    {cart.grandTotalPlatformCost?.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Margin Banner */}
                        {cart.totalExpectedProfit > 0 && (
                            <div className="mb-4 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">
                                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase">
                                    <TrendingUp size={14} /> Total Dropship Margin
                                </div>
                                <span className="text-sm font-black">
                                    +₹{cart.totalExpectedProfit?.toLocaleString('en-IN')}
                                </span>
                            </div>
                        )}

                        {/* Guardrails */}
                        {isB2BPending && (
                            <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-[10px] font-bold text-amber-800">
                                <Lock size={14} className="mt-0.5 shrink-0" />
                                <p>
                                    Checkout locked.{' '}
                                    <Link to="/kyc" onClick={onClose} className="underline">
                                        Complete KYC
                                    </Link>{' '}
                                    to procure.
                                </p>
                            </div>
                        )}
                        {hasDropshipItems && hasWholesaleItems && !isB2BPending && (
                            <div className="mb-3 flex items-start gap-2 rounded-lg bg-indigo-50 p-2.5 text-[10px] font-bold text-indigo-700">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <p>
                                    Mixed order: Dropship items will require separate shipping
                                    addresses at checkout.
                                </p>
                            </div>
                        )}

                        {/* Checkout Button */}
                        <button
                            onClick={handleCheckout}
                            disabled={isLoading || isB2BPending}
                            className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-extrabold tracking-widest text-white uppercase transition-all hover:bg-slate-800 disabled:opacity-50"
                        >
                            {isB2BPending ? 'KYC Required' : 'Proceed to Checkout'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
