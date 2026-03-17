import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    CreditCard,
    Landmark,
    Package,
    Smartphone,
    ShieldCheck,
    FileText,
    Building2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Wallet,
} from 'lucide-react';
import api from '../utils/api.js';
import { useCartStore } from '../store/cartStore';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const items = location.state?.items;

    const clearCart = useCartStore((state) => state.clearCart);

    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [paymentTerms, setPaymentTerms] = useState('DUE_ON_RECEIPT');
    const [loading, setLoading] = useState(false);

    const [gstin, setGstin] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [formError, setFormError] = useState('');

    const isGstinValid =
        gstin.length === 0 ||
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.toUpperCase());

    const financials = useMemo(() => {
        if (!items) return { subtotal: 0, totalGst: 0, totalAmount: 0 };

        let subtotalBase = 0;
        let totalGst = 0;

        items.forEach((item) => {
            const basePrice =
                item.price || item.product?.price || item.product?.platformSellPrice || 0;
            const qty = item.qty || 1;
            const gstPercent = item.product?.gstPercent || item.product?.taxSlab || 18;

            const itemSubtotal = basePrice * qty;
            const itemTax = itemSubtotal * (gstPercent / 100);

            subtotalBase += itemSubtotal;
            totalGst += itemTax;
        });

        return {
            subtotal: Math.round((subtotalBase + Number.EPSILON) * 100) / 100,
            totalGst: Math.round((totalGst + Number.EPSILON) * 100) / 100,
            totalAmount: Math.round((subtotalBase + totalGst + Number.EPSILON) * 100) / 100,
        };
    }, [items]);

    if (!items || items?.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center p-6 pb-24 lg:pb-6">
                <div className="w-full max-w-md rounded-[2.5rem] border border-slate-100 bg-white p-10 text-center shadow-sm md:p-12">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                        <Package size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        Your Procurement Cart is Empty
                    </h2>
                    <p className="mb-8 font-medium text-slate-500">
                        Add wholesale items to your cart to proceed with checkout.
                    </p>
                    <Link
                        to="/"
                        className="bg-primary hover:bg-primary-light block w-full rounded-full py-4 font-bold tracking-wide text-white shadow-md transition-all duration-300"
                    >
                        Browse Catalog
                    </Link>
                </div>
            </div>
        );
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!companyName.trim()) {
            setFormError('Company Name is required for B2B billing.');
            return;
        }

        if (gstin && !isGstinValid) {
            setFormError('Please enter a valid 15-character GSTIN.');
            return;
        }

        setLoading(true);

        try {
            const rawItems = items.map((i) => ({
                productId: i.productId || i.product._id,
                qty: i.qty,
            }));

            const backendPaymentMethod = ['UPI', 'CARD', 'NETBANKING'].includes(paymentMethod)
                ? 'RAZORPAY'
                : paymentMethod;

            const orderRes = await api.post('/orders', {
                items: rawItems,
                paymentMethod: backendPaymentMethod,
                paymentTerms,
                billingDetails: { gstin: gstin.toUpperCase(), companyName },
            });

            const { order, invoice } = orderRes.data.data;

            if (backendPaymentMethod !== 'RAZORPAY') {
                clearCart();
                navigate('/orders', {
                    state: { successMessage: `Order placed! ID: ${order.orderId}` },
                });
                return;
            }

            const res = await loadRazorpayScript();
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                setLoading(false);
                return;
            }

            const rzpOrderRes = await api.post('/payments/create-order', {
                invoiceId: invoice._id,
            });
            const rzpOrder = rzpOrderRes.data.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
                amount: rzpOrder.amount,
                currency: 'INR',
                name: 'Sovely B2B',
                description: `B2B Order ${order.orderId}`,
                order_id: rzpOrder.id,
                handler: async function (response) {
                    try {
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            invoiceId: invoice._id,
                        });
                        clearCart();
                        navigate('/orders');
                    } catch (err) {
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: companyName || 'B2B Customer',
                    email: 'procurement@example.com',
                    contact: '9999999999',
                },
                theme: {
                    color: '#1B4332',
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to process checkout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="selection:bg-primary/30 mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-24 font-sans text-slate-900 sm:px-6 lg:px-8 lg:py-12 lg:pb-12">
            <Link
                to="/"
                className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={16} /> Back to Catalog
            </Link>

            <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
                <div className="w-full flex-1 space-y-8">
                    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                    Billing Details
                                </h2>
                                <p className="mt-1 text-sm font-medium text-slate-500">
                                    Required for accurate B2B invoicing
                                </p>
                            </div>
                            <Building2 className="text-slate-300" size={32} />
                        </div>

                        {formError && (
                            <div className="animate-in fade-in mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                                <AlertCircle size={18} /> {formError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Company Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="e.g. Acme Retail Solutions"
                                    className="focus:border-primary focus:ring-primary w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition-all outline-none focus:ring-1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-2 block flex justify-between text-sm font-bold text-slate-700">
                                    <span>GSTIN (Optional)</span>
                                    {gstin && isGstinValid && (
                                        <span className="flex items-center gap-1 text-xs text-green-600">
                                            <CheckCircle2 size={12} /> Valid Format
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    value={gstin}
                                    onChange={(e) => setGstin(e.target.value)}
                                    placeholder="e.g. 29ABCDE1234F1Z5"
                                    maxLength={15}
                                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 uppercase transition-all outline-none ${
                                        gstin && !isGstinValid
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                            : 'focus:border-primary focus:ring-primary border-slate-200'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Payment Method
                            </h2>
                            <ShieldCheck className="text-green-500" size={28} />
                        </div>

                        <div className="mb-6 flex inline-flex gap-3 rounded-xl bg-slate-100 p-1.5">
                            <button
                                onClick={() => setPaymentTerms('DUE_ON_RECEIPT')}
                                className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${paymentTerms === 'DUE_ON_RECEIPT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Pay Now (Advance)
                            </button>
                            <button
                                onClick={() => setPaymentTerms('NET_30')}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${paymentTerms === 'NET_30' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Clock size={14} /> Request Net-30
                            </button>
                        </div>

                        {paymentTerms === 'DUE_ON_RECEIPT' ? (
                            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {[
                                    {
                                        id: 'UPI',
                                        label: 'UPI (GPay, PhonePe, Paytm)',
                                        icon: Smartphone,
                                    },
                                    {
                                        id: 'CARD',
                                        label: 'Credit / Debit Card',
                                        icon: CreditCard,
                                    },
                                    {
                                        id: 'NETBANKING',
                                        label: 'Net Banking',
                                        icon: Landmark,
                                    },
                                    {
                                        id: 'WALLET',
                                        label: 'Sovely Wallet (Pay from Balance)',
                                        icon: Wallet,
                                    },
                                    {
                                        id: 'BANK_TRANSFER',
                                        label: 'NEFT / RTGS (B2B)',
                                        icon: Landmark,
                                    },
                                ].map((method) => (
                                    <div
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`group relative flex cursor-pointer flex-col rounded-2xl border-2 p-5 transition-all duration-200 ${
                                            paymentMethod === method.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-slate-100 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <method.icon
                                                size={24}
                                                className={
                                                    paymentMethod === method.id
                                                        ? 'text-primary'
                                                        : 'text-slate-400 transition-colors group-hover:text-slate-600'
                                                }
                                            />
                                            <div
                                                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${paymentMethod === method.id ? 'border-primary' : 'border-slate-300'}`}
                                            >
                                                {paymentMethod === method.id && (
                                                    <div className="bg-primary h-2.5 w-2.5 rounded-full" />
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className={`text-sm font-bold ${paymentMethod === method.id ? 'text-slate-900' : 'text-slate-600'}`}
                                        >
                                            {method.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
                                <h4 className="mb-2 font-extrabold text-slate-900">
                                    Net-30 Credit Request
                                </h4>
                                <p className="mb-0 text-sm font-medium text-slate-600">
                                    Your order will be placed as a Purchase Order (PO). Our credit
                                    team will verify your company details and approve the dispatch
                                    within 24 hours. Invoice due 30 days from dispatch.
                                </p>
                            </div>
                        )}

                        {paymentMethod === 'BANK_TRANSFER' && paymentTerms === 'DUE_ON_RECEIPT' && (
                            <div className="animate-in fade-in mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 duration-300">
                                <h4 className="mb-2 flex items-center gap-2 font-extrabold text-slate-900">
                                    <Landmark size={18} className="text-slate-500" />
                                    Manual Transfer Required
                                </h4>
                                <p className="mb-4 text-sm leading-relaxed font-medium text-slate-600">
                                    Please transfer exactly{' '}
                                    <span className="font-extrabold text-slate-900">
                                        ₹{financials.totalAmount.toLocaleString('en-IN')}
                                    </span>{' '}
                                    to the following account:
                                </p>
                                <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-400">Bank:</span>{' '}
                                        <span className="font-bold text-slate-900">
                                            Sovely National Bank
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-400">Account:</span>{' '}
                                        <span className="font-mono font-bold tracking-wider text-slate-900">
                                            1234 5678 9012 3456
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-400">IFSC:</span>{' '}
                                        <span className="font-mono font-bold tracking-wider text-slate-900">
                                            SOVE0001234
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="bg-primary hover:bg-primary-light flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold tracking-wide text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                    Processing...
                                </>
                            ) : paymentTerms === 'NET_30' ? (
                                `Submit PO for ₹${financials.totalAmount.toLocaleString('en-IN')}`
                            ) : (
                                `Authorize ₹${financials.totalAmount.toLocaleString('en-IN')}`
                            )}
                        </button>
                        <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs font-bold text-slate-400">
                            <ShieldCheck size={14} /> Payments are secure and encrypted
                        </p>
                    </div>
                </div>

                <div className="w-full lg:sticky lg:top-28 lg:w-[400px] xl:w-[450px]">
                    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                        <h3 className="mb-6 text-xl font-extrabold tracking-tight text-slate-900">
                            Procurement Summary
                        </h3>

                        <div className="custom-scrollbar mb-6 max-h-[300px] space-y-4 overflow-y-auto border-b border-slate-100 pr-2 pb-6">
                            {items.map((item, idx) => {
                                const product = item.product || item;

                                const price =
                                    item.price || product.price || product.platformSellPrice || 0;
                                let safeThumb = 'https://via.placeholder.com/64';
                                if (product.image)
                                    safeThumb =
                                        typeof product.image === 'string'
                                            ? product.image
                                            : product.image.url;
                                else if (product.images?.[0])
                                    safeThumb =
                                        typeof product.images[0] === 'string'
                                            ? product.images[0]
                                            : product.images[0].url;

                                return (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                            <img
                                                src={safeThumb}
                                                alt="Product"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="truncate text-sm font-bold text-slate-900">
                                                {product.title || product.name || 'Product Item'}
                                            </h4>
                                            <p className="text-xs font-medium text-slate-500">
                                                Qty: {item.qty} x ₹{price.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="text-sm font-extrabold whitespace-nowrap text-slate-900">
                                            ₹{(price * item.qty).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-3 border-b border-slate-100 pb-6 text-sm font-medium text-slate-500">
                            <div className="flex justify-between">
                                <span>Subtotal (Base Value)</span>
                                <span className="font-bold text-slate-900">
                                    ₹{financials.subtotal.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-green-600">
                                <span className="flex items-center gap-1">
                                    <FileText size={14} /> Total GST (ITC Claimable)
                                </span>
                                <span className="font-bold">
                                    + ₹{financials.totalGst.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pan-India Shipping</span>
                                <span className="font-bold text-slate-900">Free</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <div>
                                <span className="block text-lg font-extrabold text-slate-900">
                                    Total Invoice
                                </span>
                                {gstin && isGstinValid ? (
                                    <span className="text-[10px] font-bold tracking-wider text-green-600 uppercase">
                                        B2B INVOICE ELIGIBLE
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                        RETAIL INVOICE
                                    </span>
                                )}
                            </div>
                            <span className="text-primary text-2xl font-black tracking-tight">
                                ₹{financials.totalAmount.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Checkout;
