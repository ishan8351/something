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
} from 'lucide-react';
import api from '../utils/api.js';
import { AuthContext } from '../AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

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
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="border-t-accent h-10 w-10 animate-spin rounded-full border-4 border-slate-200"></div>
            </div>
        );
    if (!user) return null;

    return (
        <div className="selection:bg-accent/30 flex min-h-screen flex-col bg-slate-50 font-sans">
            <Navbar />

            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <Link
                    to="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-900"
                >
                    <ArrowLeft size={16} /> Return to Store
                </Link>

                <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
                    {}
                    <div className="relative overflow-hidden bg-slate-900 px-8 py-10">
                        <div className="bg-accent/20 absolute -top-24 -right-12 h-64 w-64 rounded-full mix-blend-screen blur-3xl"></div>
                        <div className="absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-pink-500/20 mix-blend-screen blur-3xl"></div>

                        <div className="relative z-10 flex items-center gap-6">
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
                                <h1 className="mb-1 text-3xl font-extrabold tracking-tight">
                                    Hello, {user.name}
                                </h1>
                                <p className="flex items-center gap-2 font-medium text-slate-300">
                                    <Mail size={16} /> {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                        {}
                        <div className="space-y-6">
                            <h3 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                                <User size={24} className="text-accent" /> My Profile
                            </h3>

                            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-green-500 shadow-sm">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                        Role Access
                                    </span>
                                    <span className="font-bold text-slate-900">
                                        {user.role || 'Customer'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                        Member Since
                                    </span>
                                    <span className="font-bold text-slate-900">
                                        {new Date(user.createdAt || Date.now()).toLocaleDateString(
                                            'en-US',
                                            { year: 'numeric', month: 'long' }
                                        )}
                                    </span>
                                </div>
                            </div>

                            <Link
                                to="/orders"
                                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-900 bg-white py-4 font-bold tracking-wide text-slate-900 transition-all hover:bg-slate-900 hover:text-white"
                            >
                                <Package size={18} /> View My Orders
                            </Link>
                        </div>

                        {}
                        <div className="space-y-6">
                            <h3 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                                <Wallet size={24} className="text-accent" /> Sovely Wallet
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
                                    <Plus size={18} strokeWidth={3} /> Add Money
                                </button>
                            </form>
                        </div>
                    </div>

                    {}
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
            <Footer />
        </div>
    );
};

export default MyAccount;
