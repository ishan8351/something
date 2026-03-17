import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Shield,
    Calendar,
    LogOut,
    Wallet,
    Plus,
    Package,
    ArrowLeft,
    Building2,
    FileText,
    AlertCircle,
    BadgeCheck,
} from 'lucide-react';
import api from '../utils/api.js';
import { AuthContext } from '../AuthContext';

const MyAccount = () => {
    const { user, loading, logout } = useContext(AuthContext);
    const [walletBalance, setWalletBalance] = useState(0);
    const [amountToAdd, setAmountToAdd] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
            return;
        }
        if (user) {
            fetchWalletBalance();
        }
    }, [user, loading, navigate]);

    const fetchWalletBalance = async () => {
        try {
            const res = await api.get('/wallet/balance');
            setWalletBalance(res.data.data.balance || 0);
        } catch (error) {
            console.error('Failed to fetch wallet balance', error);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleAddMoney = async (e) => {
        e.preventDefault();
        const amt = parseFloat(amountToAdd);
        if (!amt || amt <= 0) return alert('Enter a valid amount');

        const res = await loadRazorpayScript();
        if (!res) {
            alert('Razorpay SDK failed to load');
            return;
        }

        try {
            const orderRes = await api.post('/wallet/add-money', { amount: amt });
            const { razorpayOrderId, amount, currency, keyId, invoiceId } = orderRes.data.data;

            if (keyId === 'rzp_test_dummy') {
                console.warn('[MOCK MODE] Simulating successful user payment in Razorpay window');
                await api.post('/payments/verify', {
                    razorpay_order_id: razorpayOrderId,
                    razorpay_payment_id: 'pay_mock_' + Date.now(),
                    razorpay_signature: 'mock_signature_bypass',
                    invoiceId: invoiceId,
                });
                alert('Wallet topped up successfully! (MOCK MODE)');
                setAmountToAdd('');
                fetchWalletBalance();
                return;
            }

            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: 'Sovely E-Commerce',
                description: 'Wallet Top-up',
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            invoiceId: invoiceId,
                        });
                        alert('Wallet topped up successfully!');
                        setAmountToAdd('');
                        fetchWalletBalance();
                    } catch (err) {
                        alert('Payment verification failed.');
                    }
                },
                theme: { color: '#8b5cf6' },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            alert('Failed to initialize top-up: ' + errorMessage);
            console.error('Top-up failed', error.response?.data || error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading)
        return (
            <div className="flex flex-1 items-center justify-center p-20">
                <div className="border-t-accent h-10 w-10 animate-spin rounded-full border-4 border-slate-200"></div>
            </div>
        );

    if (!user) return null;

    const isB2B = user.accountType === 'B2B';
    const isPendingB2B = isB2B && !user.isVerifiedB2B;

    return (
        <main className="selection:bg-accent/30 mx-auto w-full max-w-6xl flex-1 px-4 py-8 font-sans text-slate-900 sm:px-6 lg:px-8 lg:py-12">
            <Link
                to="/"
                className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={16} /> Return to Store
            </Link>

            {}
            {isPendingB2B && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 shadow-sm">
                    <AlertCircle className="mt-0.5 shrink-0 text-yellow-600" size={20} />
                    <div>
                        <h4 className="font-bold">Business Account Pending Verification</h4>
                        <p className="mt-1 text-sm font-medium text-yellow-700">
                            Your GSTIN and company details are currently being reviewed. You will
                            see standard retail pricing until your account is approved (usually
                            within 24-48 hours).
                        </p>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
                {}
                <div className="relative overflow-hidden bg-slate-900 px-8 py-10">
                    <div className="bg-accent/20 absolute -top-24 -right-12 h-64 w-64 rounded-full mix-blend-screen blur-3xl"></div>
                    <div className="absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-pink-500/20 mix-blend-screen blur-3xl"></div>

                    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="flex items-center gap-6">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white text-4xl font-black text-slate-900 shadow-xl">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="Avatar"
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    user.name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                            <div className="text-white">
                                <h1 className="mb-1 flex items-center gap-3 text-3xl font-extrabold tracking-tight">
                                    Hello, {user.name}
                                    {user.isVerifiedB2B && (
                                        <span title="Verified B2B Buyer">
                                            <BadgeCheck size={28} className="text-blue-400" />
                                        </span>
                                    )}
                                </h1>
                                <p className="flex items-center gap-2 font-medium text-slate-300">
                                    <Mail size={16} /> {user.email}
                                </p>
                            </div>
                        </div>

                        {}
                        <div className="flex flex-col items-start md:items-end">
                            <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                Account Type
                            </span>
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-extrabold tracking-wider uppercase ${isB2B ? 'border border-blue-500/30 bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-300'}`}
                            >
                                {isB2B ? 'B2B Wholesale' : 'Retail Customer'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-3">
                    {}
                    <div className="space-y-8 lg:col-span-2">
                        {}
                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-slate-900">
                                <User size={24} className="text-accent" /> Personal Details
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-green-500 shadow-sm">
                                        <Shield size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                            Role Access
                                        </span>
                                        <span className="block truncate font-bold text-slate-900">
                                            {user.role || 'Customer'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                                        <Calendar size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                            Member Since
                                        </span>
                                        <span className="block truncate font-bold text-slate-900">
                                            {new Date(
                                                user.createdAt || Date.now()
                                            ).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {}
                        {isB2B && (
                            <div>
                                <h3 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-slate-900">
                                    <Building2 size={24} className="text-accent" /> Business
                                    Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm">
                                            <Building2 size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                Company Name
                                            </span>
                                            <span className="block truncate font-bold text-slate-900">
                                                {user.companyName || 'Not Provided'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-purple-500 shadow-sm">
                                            <FileText size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                GSTIN
                                            </span>
                                            <span className="block truncate font-bold text-slate-900">
                                                {user.gstin || 'Not Provided'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Link
                            to="/orders"
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-900 bg-white py-4 font-bold tracking-wide text-slate-900 transition-all hover:bg-slate-900 hover:text-white"
                        >
                            <Package size={18} /> View My Orders & Invoices
                        </Link>
                    </div>

                    {}
                    <div className="space-y-6 lg:border-l lg:border-slate-100 lg:pl-8">
                        <h3 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                            <Wallet size={24} className="text-accent" /> Corporate Wallet
                        </h3>

                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center shadow-lg">
                            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
                            <span className="relative z-10 mb-2 block text-xs font-bold tracking-widest text-slate-300 uppercase">
                                Available Balance
                            </span>
                            <div className="relative z-10 text-4xl font-black text-white">
                                ₹{walletBalance.toLocaleString('en-IN')}
                            </div>
                        </div>

                        <form onSubmit={handleAddMoney} className="space-y-4">
                            <div className="relative">
                                <span className="absolute top-1/2 left-5 -translate-y-1/2 font-bold text-slate-400">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    placeholder="Enter amount to add"
                                    value={amountToAdd}
                                    onChange={(e) => setAmountToAdd(e.target.value)}
                                    min="1"
                                    required
                                    className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pr-5 pl-12 text-sm font-bold text-slate-900 transition-all outline-none placeholder:font-medium placeholder:text-slate-400 focus:ring-1"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-accent hover:bg-accent-glow hover:shadow-accent/30 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold tracking-wide text-white transition-all hover:shadow-lg"
                            >
                                <Plus size={18} strokeWidth={3} /> Add Funds
                            </button>
                            <p className="text-center text-xs font-medium text-slate-500">
                                Use your wallet for faster, one-click checkout on bulk orders.
                            </p>
                        </form>
                    </div>
                </div>

                <div className="flex justify-center border-t border-slate-100 bg-slate-50/50 p-6">
                    <button
                        onClick={handleLogout}
                        className="text-danger border-danger/20 hover:bg-danger flex items-center gap-2 rounded-full border bg-white px-8 py-3 font-bold shadow-sm transition-all hover:text-white"
                    >
                        <LogOut size={16} /> Log Out
                    </button>
                </div>
            </div>
        </main>
    );
};

export default MyAccount;
