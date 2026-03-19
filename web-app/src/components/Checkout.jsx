import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import {
    ArrowLeft,
    Package,
    MapPin,
    Wallet,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    ShoppingCart,
    Lock,
    Building2,
    Truck,
} from 'lucide-react';
import api from '../utils/api.js';
import { useCartStore } from '../store/cartStore';
import { AuthContext } from '../AuthContext';
import LoadingScreen from './LoadingScreen';

const dropshipCustomerSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile number required'),
    street: z.string().trim().min(5, 'Please provide a complete street address'),
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().trim().min(2, 'State is required'),
    zip: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
});

const Checkout = () => {
    const navigate = useNavigate();
    const { user, isKycApproved } = useContext(AuthContext);
    const { cart, fetchCart, clearCartState } = useCartStore();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state for Dropship orders
    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zip: '',
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [idempotencyKey] = useState(() => crypto.randomUUID());

    const handleInputChange = (field, value) => {
        setCustomer((prev) => ({ ...prev, [field]: value }));
        // Clear the specific error when the user starts typing
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    // Payment method for Dropship end-customer collection
    const [paymentMethod, setPaymentMethod] = useState('COD');

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    if (!cart) return <LoadingScreen />;

    if (cart.items?.length === 0) {
        return (
            <div className="flex min-h-[70vh] flex-1 items-center justify-center p-6">
                <div className="w-full max-w-md rounded-[2.5rem] border border-slate-100 bg-white p-10 text-center shadow-xl shadow-slate-200/50">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                        <Package size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="mb-2 text-2xl font-extrabold text-slate-900">Cart is Empty</h2>
                    <p className="mb-8 leading-relaxed font-medium text-slate-500">
                        Add wholesale items or queue dropship products to proceed with checkout.
                    </p>
                    <Link
                        to="/"
                        className="block w-full rounded-2xl bg-slate-900 py-4 font-extrabold tracking-widest text-white uppercase shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800"
                    >
                        Browse Catalog
                    </Link>
                </div>
            </div>
        );
    }

    const hasDropship = cart.items.some((item) => item.orderType === 'DROPSHIP');
    const hasWholesale = cart.items.some((item) => item.orderType === 'WHOLESALE');
    const isWalletSufficient = user?.walletBalance >= cart.grandTotalPlatformCost;
    const projectedBalance = (user?.walletBalance || 0) - (cart.grandTotalPlatformCost || 0);

    const handlePinCodeChange = async (e) => {
        const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
        setCustomer((prev) => ({ ...prev, zip: pin }));

        // Auto-fetch City and State when 6 digits are entered
        if (pin.length === 6) {
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const data = await response.json();

                if (data && data[0].Status === 'Success') {
                    const postOffice = data[0].PostOffice[0];
                    setCustomer((prev) => ({
                        ...prev,
                        city: postOffice.District,
                        state: postOffice.State,
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch PIN code details', err);
            }
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError('');

        if (!isKycApproved) {
            setError('Business KYC must be approved to procure inventory. Contact support.');
            return;
        }

        if (!isWalletSufficient) {
            setError(
                'Insufficient wallet balance. Please add working capital to cover the platform cost.'
            );
            return;
        }

        setFieldErrors({}); // Clear old errors

        if (hasDropship) {
            const validationResult = dropshipCustomerSchema.safeParse(customer);

            if (!validationResult.success) {
                // Flatten the Zod errors into a simple object: { phone: "Error msg", zip: "Error msg" }
                const formattedErrors = validationResult.error.format();
                const extractedErrors = {};

                if (formattedErrors.name) extractedErrors.name = formattedErrors.name._errors[0];
                if (formattedErrors.phone) extractedErrors.phone = formattedErrors.phone._errors[0];
                if (formattedErrors.street)
                    extractedErrors.street = formattedErrors.street._errors[0];
                if (formattedErrors.city) extractedErrors.city = formattedErrors.city._errors[0];
                if (formattedErrors.state) extractedErrors.state = formattedErrors.state._errors[0];
                if (formattedErrors.zip) extractedErrors.zip = formattedErrors.zip._errors[0];

                setFieldErrors(extractedErrors);
                setError('Please fix the highlighted errors in the shipping details.');
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to show the main banner
                return;
            }
        }

        setLoading(true);

        try {
            const payload = {
                paymentMethod: hasDropship ? paymentMethod : 'PREPAID_WALLET',
                endCustomerDetails: hasDropship
                    ? {
                          name: customer.name,
                          phone: customer.phone,
                          address: {
                              street: customer.street,
                              city: customer.city,
                              state: customer.state,
                              zip: customer.zip,
                          },
                      }
                    : null,
            };

            const res = await api.post('/orders', payload, {
                headers: {
                    'x-idempotency-key': idempotencyKey,
                },
            });
            clearCartState();

            // NEW: Handle the array of created orders
            const createdOrders = res.data.data;
            const generatedIds = createdOrders.map((order) => order.orderId).join(', ');

            navigate('/orders', {
                state: { successMessage: `Procurement successful! Ref IDs: ${generatedIds}` },
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Transaction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-8 pb-24 font-sans text-slate-900">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft size={16} /> Edit Cart
                    </button>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Secure Checkout
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Review your procurement details and authorize wallet deduction.
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-start gap-8 xl:flex-row xl:gap-12">
                {/* Left Column: Forms & Logistics */}
                <div className="w-full flex-1 space-y-8">
                    {error && (
                        <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 font-bold text-red-700">
                            <AlertCircle size={24} className="shrink-0" /> <p>{error}</p>
                        </div>
                    )}

                    {!isKycApproved && (
                        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                            <ShieldCheck size={28} className="shrink-0 text-amber-600" />
                            <div>
                                <h3 className="text-lg font-extrabold text-amber-900">
                                    Action Required: Business KYC Pending
                                </h3>
                                <p className="mt-1 text-sm font-medium text-amber-800">
                                    Orders cannot be dispatched until your business identity is
                                    verified. Proceed with caution.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Mixed Cart Warning */}
                    {hasDropship && hasWholesale && (
                        <div className="rounded-3xl border border-indigo-200 bg-indigo-50/50 p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 rounded-xl bg-indigo-100 p-2 text-indigo-600">
                                    <ShoppingCart size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-indigo-900">
                                        Mixed Order Detected
                                    </h3>
                                    <p className="mt-1 text-sm leading-relaxed font-medium text-indigo-700">
                                        Your cart contains both Wholesale and Dropship items.
                                        Wholesale items will be sent to your registered business
                                        address. Please provide the end-customer address below for
                                        the Dropship items.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logistics Block 1: Wholesale */}
                    {hasWholesale && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-slate-900">
                                        Standard B2B Delivery
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500">
                                        Bulk items will be shipped to your registered HQ.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                <div>
                                    <p className="font-bold text-slate-900">
                                        {user?.companyName || 'Verified Business Entity'}
                                    </p>
                                    <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-600">
                                        {user?.companyAddress ||
                                            'Your address is securely stored and verified via KYC documents.'}
                                    </p>
                                    {user?.gstin && (
                                        <p className="mt-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
                                            GSTIN: {user.gstin}
                                        </p>
                                    )}
                                </div>
                                <div
                                    className="rounded-xl bg-slate-200 p-2 text-slate-500"
                                    title="Locked via KYC"
                                >
                                    <Lock size={18} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logistics Block 2: Dropship */}
                    {hasDropship && (
                        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Truck size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 shadow-sm">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-slate-900">
                                            Dropship Dispatch Details
                                        </h2>
                                        <p className="text-sm font-medium text-slate-500">
                                            Where are we sending the retail items?
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="pl-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                            Customer Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={customer.name}
                                            onChange={(e) =>
                                                handleInputChange('name', e.target.value)
                                            }
                                            className={`w-full rounded-xl border px-4 py-3.5 font-bold text-slate-900 transition-all outline-none focus:ring-2 ${
                                                fieldErrors.name
                                                    ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-200'
                                                    : 'border-slate-200 bg-slate-50 focus:border-transparent focus:ring-amber-400'
                                            }`}
                                        />
                                        {fieldErrors.name && (
                                            <p className="mt-1 pl-1 text-xs font-bold text-red-500">
                                                {fieldErrors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="pl-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={customer.phone}
                                            onChange={(e) =>
                                                setCustomer({
                                                    ...customer,
                                                    phone: e.target.value.replace(/\D/g, ''),
                                                })
                                            }
                                            maxLength="10"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-bold text-slate-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-amber-400"
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="pl-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            value={customer.street}
                                            onChange={(e) =>
                                                setCustomer({ ...customer, street: e.target.value })
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-bold text-slate-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-amber-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="pl-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={customer.city}
                                            onChange={(e) =>
                                                setCustomer({ ...customer, city: e.target.value })
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-bold text-slate-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-amber-400"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="pl-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                                State *
                                            </label>
                                            <input
                                                type="text"
                                                value={customer.state}
                                                onChange={(e) =>
                                                    setCustomer({
                                                        ...customer,
                                                        state: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-bold text-slate-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-amber-400"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="pl-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                                PIN Code *
                                            </label>
                                            <input
                                                type="text"
                                                value={customer.zip}
                                                onChange={handlePinCodeChange}
                                                maxLength="6"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-bold text-slate-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-amber-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dropship Customer Payment Collection */}
                                <div className="mt-8 border-t border-slate-100 pt-8">
                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                                        How is the end-customer paying?
                                    </h3>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <button
                                            onClick={() => setPaymentMethod('COD')}
                                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-extrabold transition-all ${paymentMethod === 'COD' ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                                        >
                                            <div
                                                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${paymentMethod === 'COD' ? 'border-amber-500' : 'border-slate-300'}`}
                                            >
                                                {paymentMethod === 'COD' && (
                                                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                )}
                                            </div>
                                            Cash on Delivery (COD)
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('PREPAID_GATEWAY')}
                                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-extrabold transition-all ${paymentMethod === 'PREPAID_GATEWAY' ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                                        >
                                            <div
                                                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${paymentMethod === 'PREPAID_GATEWAY' ? 'border-amber-500' : 'border-slate-300'}`}
                                            >
                                                {paymentMethod === 'PREPAID_GATEWAY' && (
                                                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                )}
                                            </div>
                                            Prepaid (Already Collected)
                                        </button>
                                    </div>
                                    {paymentMethod === 'COD' && (
                                        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/50 p-3 text-xs font-bold text-amber-700">
                                            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                                            <p>
                                                Courier will collect the Total Selling Price. Your
                                                profit margin will be credited to your wallet 48hrs
                                                after successful delivery.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Order Summary & Wallet Authorization */}
                <div className="w-full shrink-0 space-y-6 xl:sticky xl:top-28 xl:w-[420px]">
                    {/* The Wallet Payment Card */}
                    <div className="rounded-3xl bg-slate-900 p-1">
                        <div className="rounded-[1.35rem] bg-white p-6 sm:p-8">
                            <h3 className="mb-6 flex items-center justify-between text-xl font-extrabold text-slate-900">
                                Procurement Summary
                                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                                    {cart.items.length} Items
                                </span>
                            </h3>

                            <div className="custom-scrollbar mb-6 max-h-[250px] space-y-4 overflow-y-auto pr-2">
                                {cart.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="relative shrink-0">
                                            <img
                                                src={
                                                    item.productId?.images?.[0]?.url ||
                                                    'https://via.placeholder.com/64'
                                                }
                                                alt=""
                                                className="h-14 w-14 rounded-xl border border-slate-100 bg-slate-50 object-cover"
                                            />
                                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                                {item.qty}
                                            </span>
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col justify-center">
                                            <div className="mb-1 flex items-center gap-2">
                                                {item.orderType === 'DROPSHIP' ? (
                                                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-extrabold text-amber-800 uppercase shadow-sm">
                                                        Drop
                                                    </span>
                                                ) : (
                                                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[8px] font-extrabold text-indigo-800 uppercase shadow-sm">
                                                        Bulk
                                                    </span>
                                                )}
                                                <h4 className="truncate text-sm font-bold text-slate-900">
                                                    {item.productId?.title}
                                                </h4>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                    ₹
                                                    {item.platformUnitCost?.toLocaleString('en-IN')}{' '}
                                                    /ea
                                                </p>
                                                <span className="text-sm font-extrabold text-slate-900">
                                                    ₹
                                                    {item.totalItemPlatformCost?.toLocaleString(
                                                        'en-IN'
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-5 space-y-3 border-y border-slate-100 py-5 text-sm">
                                <div className="flex justify-between font-bold text-slate-500">
                                    <span>Platform Subtotal</span>
                                    <span className="text-slate-900">
                                        ₹
                                        {cart.subTotalPlatformCost?.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="-mx-2 flex justify-between rounded-lg bg-emerald-50 px-2 py-1.5 font-bold text-emerald-700">
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck size={16} /> GST (ITC Claimable)
                                    </span>
                                    <span>
                                        + ₹
                                        {cart.totalTax?.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* The Wallet Preview Feature */}
                            <div
                                className={`mb-6 rounded-2xl border-2 p-5 ${isWalletSufficient ? 'border-slate-200 bg-slate-50' : 'border-red-200 bg-red-50'}`}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="font-extrabold text-slate-900">
                                        Wallet Deduction
                                    </span>
                                    <span className="text-2xl font-black text-slate-900">
                                        ₹
                                        {cart.grandTotalPlatformCost?.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 border-t border-slate-200/60 pt-4 text-xs font-bold">
                                    <div className="flex-1">
                                        <p className="mb-0.5 text-[9px] tracking-widest text-slate-400 uppercase">
                                            Current Bal
                                        </p>
                                        <p className="text-slate-700">
                                            ₹{user?.walletBalance?.toLocaleString('en-IN') || '0'}
                                        </p>
                                    </div>
                                    <ArrowLeft size={14} className="text-slate-300" />
                                    <div className="flex-1 text-right">
                                        <p className="mb-0.5 text-[9px] tracking-widest text-slate-400 uppercase">
                                            Remaining Bal
                                        </p>
                                        <p
                                            className={
                                                projectedBalance >= 0
                                                    ? 'text-emerald-600'
                                                    : 'text-red-600'
                                            }
                                        >
                                            {projectedBalance >= 0
                                                ? `₹${projectedBalance.toLocaleString('en-IN')}`
                                                : 'Insufficient'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!isWalletSufficient && (
                                <div className="mb-6">
                                    <Link
                                        to="/wallet"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-extrabold tracking-widest text-white uppercase shadow-md transition-all hover:bg-red-700"
                                    >
                                        <Wallet size={18} /> Recharge Wallet
                                    </Link>
                                    <p className="mt-2 text-center text-[10px] font-bold text-red-500">
                                        Required: ₹
                                        {Math.abs(projectedBalance).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            )}

                            {cart.totalExpectedProfit > 0 && paymentMethod === 'COD' && (
                                <div className="mb-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white shadow-sm transition-transform hover:scale-[1.02]">
                                    <span className="flex items-center gap-2 text-xs font-extrabold tracking-wider uppercase">
                                        <TrendingUp size={16} /> Expected Margin
                                    </span>
                                    <span className="text-xl font-black">
                                        + ₹
                                        {cart.totalExpectedProfit?.toLocaleString('en-IN', {
                                            minimumFractionDigits: 0,
                                        })}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading || !isWalletSufficient || !isKycApproved}
                                className="flex w-full items-center justify-center rounded-2xl bg-slate-900 py-4.5 text-sm font-extrabold tracking-widest text-white uppercase shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-white"></div>{' '}
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Wallet size={18} className="mr-2" /> Authorize Deduction
                                    </>
                                )}
                            </button>
                            <p className="mt-4 flex items-center justify-center gap-1 text-center text-[10px] font-bold text-slate-400">
                                <Lock size={10} /> End-to-end encrypted B2B transaction
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Checkout;
