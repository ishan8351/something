import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../CartContext';
import { X, Trash2, Package, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

function CartDrawer({ isOpen, onClose }) {
    const { cartItems, updateQuantity, removeFromCart, setExactQuantity } = useContext(CartContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Calculate totals using the dynamically updated item price
    const totals = cartItems.reduce(
        (acc, item) => {
            const itemTotal = (item.price || item.product.price) * item.quantity;
            const gstAmount = itemTotal * ((item.product.gstPercent || 18) / 100);

            return {
                subtotal: acc.subtotal + itemTotal,
                gst: acc.gst + gstAmount,
                weight: acc.weight + (item.product?.weight || 0.5) * item.quantity,
            };
        },
        { subtotal: 0, gst: 0, weight: 0 }
    );

    const handleCheckout = () => {
        onClose();
        const checkoutItems = cartItems.map((item) => ({
            productId: item.product?._id || item.product?.id || item.id,
            qty: item.quantity,
            price: item.price, // Ensure the negotiated tier price goes to checkout
            product: item.product || item,
        }));
        navigate('/checkout', { state: { items: checkoutItems } });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex justify-end">
            <div
                className="animate-in fade-in absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <div
                className="animate-in slide-in-from-right relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white p-6">
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                            Procurement Cart
                            <span className="bg-primary rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Units
                            </span>
                        </h2>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                            Ready for Wholesale Checkout
                        </p>
                    </div>
                    <button
                        className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        onClick={onClose}
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Cart Items List */}
                <div className="custom-scrollbar flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
                    {cartItems.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                            <div className="mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                                <Package size={40} />
                            </div>
                            <div>
                                <h3 className="mb-1 text-xl font-extrabold text-slate-900">
                                    No items selected
                                </h3>
                                <p className="px-6 text-sm font-medium text-slate-500">
                                    Your bulk order list is empty. Browse the catalog to start
                                    sourcing.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-primary hover:shadow-primary/30 hover:bg-primary-light mt-6 rounded-full px-8 py-3 font-bold text-white shadow-lg transition-all"
                            >
                                Browse Wholesale Catalog
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item) => {
                                const product = item.product || item;
                                const itemKey = product._id || product.id;
                                // Use the dynamically calculated price stored on the cart item level
                                const price = item.price || product.price || 0;
                                const moq = product.minQuantity || product.moq || 1;

                                let safeThumb = 'https://via.placeholder.com/150';
                                if (product.image) {
                                    safeThumb =
                                        typeof product.image === 'string'
                                            ? product.image
                                            : product.image.url || safeThumb;
                                } else if (product.images?.[0]) {
                                    safeThumb =
                                        typeof product.images[0] === 'string'
                                            ? product.images[0]
                                            : product.images[0].url;
                                }

                                return (
                                    <div
                                        key={itemKey}
                                        className="group relative flex gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                                    >
                                        <div className="h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                            <img
                                                src={safeThumb}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between py-1 pr-1">
                                            <div className="flex items-start justify-between gap-2 pr-6">
                                                <div>
                                                    <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                                                        {product.category || 'Item'}
                                                    </span>
                                                    <h4 className="line-clamp-2 text-sm leading-snug font-bold text-slate-900">
                                                        {product.name}
                                                    </h4>
                                                </div>
                                            </div>

                                            <button
                                                className="hover:text-danger hover:bg-danger/10 absolute top-3 right-3 rounded-md p-1.5 text-slate-300 transition-colors"
                                                onClick={() => removeFromCart(itemKey)}
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            <div className="mt-auto">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="text-sm font-extrabold text-slate-900">
                                                        ₹{price.toLocaleString('en-IN')}{' '}
                                                        <span className="text-xs font-medium text-slate-500">
                                                            / unit
                                                        </span>
                                                    </span>
                                                    {/* Show a badge if they hit a tier discount */}
                                                    {price <
                                                        (product.basePrice || product.price) && (
                                                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                                                            Tier Discount Applied
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex h-8 items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                                                        <button
                                                            className="flex h-full w-7 items-center justify-center rounded bg-white font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                                                            onClick={() =>
                                                                updateQuantity(itemKey, -moq)
                                                            }
                                                            disabled={item.quantity <= moq}
                                                        >
                                                            −
                                                        </button>

                                                        <input
                                                            type="number"
                                                            min={moq}
                                                            step={moq}
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const val = parseInt(
                                                                    e.target.value
                                                                );
                                                                if (!isNaN(val)) {
                                                                    setExactQuantity(itemKey, val);
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                let val = parseInt(e.target.value);
                                                                if (isNaN(val) || val < moq) {
                                                                    val = moq;
                                                                } else {
                                                                    const remainder = val % moq;
                                                                    if (remainder !== 0) {
                                                                        val = val - remainder;
                                                                    }
                                                                }
                                                                setExactQuantity(itemKey, val);
                                                            }}
                                                            className="m-0 w-12 appearance-none border-none bg-transparent text-center text-sm font-bold text-slate-900 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                        />

                                                        <button
                                                            className="flex h-full w-7 items-center justify-center rounded bg-white font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
                                                            onClick={() =>
                                                                updateQuantity(itemKey, moq)
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <span className="text-primary text-sm font-bold">
                                                        ₹
                                                        {(price * item.quantity).toLocaleString(
                                                            'en-IN'
                                                        )}
                                                    </span>
                                                </div>
                                                {moq > 1 && (
                                                    <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-600">
                                                        <AlertCircle size={10} /> Order multiple:{' '}
                                                        {moq}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Totals */}
                {cartItems.length > 0 && (
                    <div className="relative z-10 border-t border-slate-200 bg-white p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-2 text-xs font-bold text-green-700">
                            <ShieldCheck size={14} /> GST Invoice generated at checkout
                        </div>

                        <div className="mb-6 space-y-2">
                            <div className="flex items-center justify-between text-sm text-slate-500">
                                <span>Total Excl. GST</span>
                                <span className="font-semibold text-slate-700">
                                    ₹{totals.subtotal.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-500">
                                <span>Estimated GST (ITC Claimable)</span>
                                <span className="font-semibold text-slate-700">
                                    + ₹{totals.gst.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="mt-2 flex items-end justify-between border-t border-slate-100 pt-3">
                                <span className="text-sm font-bold text-slate-700">
                                    Total Value
                                </span>
                                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                                    ₹{(totals.subtotal + totals.gst).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>

                        <button
                            className="hover:bg-primary hover:shadow-primary/30 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 font-bold tracking-wide text-white transition-all duration-300 hover:shadow-lg"
                            onClick={handleCheckout}
                        >
                            Proceed to Bulk Checkout <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CartDrawer;
