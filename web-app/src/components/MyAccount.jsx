import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Calendar, LogOut, Wallet, Plus, Package, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import './Auth.css';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    withCredentials: true
});

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
            console.error("Failed to fetch wallet balance", error);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleAddMoney = async (e) => {
        e.preventDefault();
        const amt = parseFloat(amountToAdd);
        if (!amt || amt <= 0) return alert("Enter a valid amount");

        const res = await loadRazorpayScript();
        if (!res) {
            alert("Razorpay SDK failed to load");
            return;
        }

        try {
            // 1. Create order on backend
            const orderRes = await api.post('/wallet/add-money', { amount: amt });
            const { razorpayOrderId, amount, currency, keyId, invoiceId } = orderRes.data.data;

            // 1.b IF MOCKING (i.e. keyId is the dummy one), auto-resolve to simulate checkout success
            if (keyId === 'rzp_test_dummy') {
                console.warn("[MOCK MODE] Simulating successful user payment in Razorpay window");
                await api.post('/payments/verify', {
                    razorpay_order_id: razorpayOrderId,
                    razorpay_payment_id: "pay_mock_" + Date.now(),
                    razorpay_signature: "mock_signature_bypass",
                    invoiceId: invoiceId
                });
                alert("Wallet topped up successfully! (MOCK MODE)");
                setAmountToAdd('');
                fetchWalletBalance();
                return;
            }

            // 2. Open Razorpay Checkout widget for real
            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: "Sovely E-Commerce",
                description: "Wallet Top-up",
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment Signature
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            invoiceId: invoiceId
                        });
                        alert("Wallet topped up successfully!");
                        setAmountToAdd('');
                        fetchWalletBalance();
                    } catch (err) {
                        alert("Payment verification failed.");
                    }
                },
                theme: { color: "#1B4332" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Unknown error";
            alert("Failed to initialize top-up: " + errorMessage);
            console.error("Top-up failed", error.response?.data || error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    if (!user) return null;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
            <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', maxWidth: '800px', width: '100%', overflow: 'hidden' }}>

                {/* Header Banner */}
                <div style={{ background: 'linear-gradient(135deg, #1b4332, #065f46)', padding: '40px', position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative Circles */}
                    <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                    <div style={{ position: 'absolute', bottom: '-20%', right: '10%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: '#fff', color: '#1B4332',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem', fontWeight: '700', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}>
                            {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div style={{ color: '#fff' }}>
                            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: '600' }}>Hello, {user.name}</h2>
                            <p style={{ margin: 0, opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={16} /> {user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                    {/* Left: Account Details */}
                    <div>
                        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={20} color="#1b4332" /> My Profile
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Role Access</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '500' }}>
                                    <Shield size={16} color="#059669" /> {user.role || 'Customer'}
                                </div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Member Since</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '500' }}>
                                    <Calendar size={16} color="#475569" /> {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                </div>
                            </div>

                            <Link
                                to="/orders"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    background: '#fff', border: '1px solid #1b4332', color: '#1b4332',
                                    padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: '600',
                                    transition: 'all 0.2s', marginTop: '10px'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#f0fdf4'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                            >
                                <Package size={18} /> View My Orders
                            </Link>
                        </div>
                    </div>

                    {/* Right: Wallet Details */}
                    <div>
                        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Wallet size={20} color="#1b4332" /> Sovely Wallet
                        </h3>

                        <div style={{
                            background: 'linear-gradient(to right bottom, #ffffff, #f0fdf4)',
                            padding: '32px 24px', borderRadius: '16px', border: '1px solid #dcfce7',
                            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.05)', textAlign: 'center',
                            marginBottom: '20px'
                        }}>
                            <span style={{ display: 'block', fontSize: '0.875rem', color: '#065f46', fontWeight: '500', marginBottom: '8px' }}>Available Balance</span>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0f172a' }}>
                                ₹{walletBalance.toLocaleString('en-IN')}
                            </div>
                        </div>

                        <form onSubmit={handleAddMoney} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: '600' }}>₹</span>
                                <input
                                    type="number"
                                    style={{
                                        width: '100%', padding: '16px 16px 16px 36px',
                                        borderRadius: '12px', border: '1px solid #e2e8f0',
                                        outline: 'none', fontSize: '1rem',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#1b4332'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    placeholder="Enter amount to add"
                                    value={amountToAdd}
                                    onChange={e => setAmountToAdd(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    background: '#059669', color: '#fff', padding: '16px',
                                    borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '1rem',
                                    cursor: 'pointer', transition: 'background 0.2s',
                                    boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#047857'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#059669'; }}
                            >
                                <Plus size={18} /> Add Money with Razorpay
                            </button>
                        </form>

                    </div>
                </div>

                <div style={{ padding: '24px 40px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            background: '#fff', color: '#dc2626', padding: '12px 24px', border: '1px solid #fecaca',
                            borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', margin: '0 auto', width: '200px'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                    >
                        <LogOut size={16} /> Log Out
                    </button>
                </div>

            </div>

            <Link to="/" style={{ position: 'absolute', top: '30px', left: '40px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#64748b', fontWeight: '500', transition: 'color 0.2s' }}>
                <ArrowLeft size={16} /> Return to Store
            </Link>
        </div>
    );
};

export default MyAccount;
