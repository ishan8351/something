import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard, Wallet, Landmark, Package } from 'lucide-react';
import axios from 'axios';
import './Auth.css';
import Navbar from './Navbar';
import Footer from './Footer';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    withCredentials: true
});

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const items = location.state?.items;

    const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
    const [paymentTerms, setPaymentTerms] = useState('DUE_ON_RECEIPT');
    const [loading, setLoading] = useState(false);

    if (!items || items.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fafafa' }}>
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                            <Package size={48} color="#94a3b8" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '8px' }}>Your Cart is Empty</h2>
                        <p style={{ color: '#64748b', marginBottom: '24px' }}>Looks like you haven't added anything to checkout yet.</p>
                        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: '8px', background: '#1b4332', color: '#fff' }}>
                            Continue Shopping
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Handle string formatting safely
    const totalAmount = items.reduce((acc, item) => {
        const priceRaw = item.product?.price;
        const priceStr = typeof priceRaw === 'number' ? priceRaw.toString() : (priceRaw || "0");
        const numeric = parseFloat(priceStr.replace(/[^0-9.-]+/g, "")) || 0;
        return acc + (numeric * item.qty);
    }, 0);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const rawItems = items.map(i => ({ productId: i.productId, qty: i.qty }));

            const res = await api.post('/orders', {
                items: rawItems,
                paymentMethod,
                paymentTerms
            });

            navigate('/orders', { state: { successMessage: `Order placed successfully! Order ID: ${res.data.data.order.orderId}` } });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fafafa' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>

                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#64748b', marginBottom: '32px', transition: 'color 0.2s ease', cursor: 'pointer', fontWeight: '500' }}>
                    <ArrowLeft size={18} /> Back to Shopping
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '40px', alignItems: 'start' }}>

                    {/* Left Column: Form Settings */}
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '24px', fontWeight: '600' }}>Payment Details</h2>

                        <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#475569', marginBottom: '12px' }}>Select Payment Method</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { id: 'BANK_TRANSFER', label: 'Bank Transfer (B2B)', icon: Landmark },
                                        { id: 'RAZORPAY', label: 'Credit Card / UPI', icon: CreditCard },
                                        { id: 'WALLET', label: 'Sovely Wallet', icon: Wallet },
                                    ].map(method => (
                                        <div
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                                                border: `1px solid ${paymentMethod === method.id ? '#1b4332' : '#e2e8f0'}`,
                                                borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease',
                                                backgroundColor: paymentMethod === method.id ? '#f0fdf4' : '#fff'
                                            }}
                                        >
                                            <method.icon size={20} color={paymentMethod === method.id ? '#1b4332' : '#64748b'} />
                                            <span style={{ fontWeight: '500', color: paymentMethod === method.id ? '#1b4332' : '#0f172a' }}>{method.label}</span>
                                            {paymentMethod === method.id && <CheckCircle size={18} color="#1b4332" style={{ marginLeft: 'auto' }} />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Payment Terms (B2B Accounts)</label>
                                <select
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', appearance: 'none', background: '#fff', fontSize: '1rem', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                                    value={paymentTerms}
                                    onChange={e => setPaymentTerms(e.target.value)}
                                >
                                    <option value="DUE_ON_RECEIPT">Due on Receipt</option>
                                    <option value="NET_15">Net 15 Days</option>
                                    <option value="NET_30">Net 30 Days</option>
                                </select>
                            </div>

                            {paymentMethod === 'BANK_TRANSFER' && (
                                <div style={{ padding: '20px', background: '#f8fafc', borderLeft: '4px solid #1b4332', borderRadius: '4px 8px 8px 4px', fontSize: '0.875rem', color: '#475569', lineHeight: '1.6' }}>
                                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '8px' }}>Manual Transfer Required</strong>
                                    Please transfer exactly <b style={{ color: '#1b4332' }}>₹{totalAmount.toLocaleString('en-IN')}</b> to the following account:<br /><br />
                                    Bank: <b>Sovely National Bank</b><br />
                                    Account: <b>1234 5678 9012 3456</b><br />
                                    IFSC: <b>SOVE0001234</b><br /><br />
                                    <i>Your order will remain in 'Pending' state until funds clear our systems.</i>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: '#1b4332', color: '#fff', padding: '16px', borderRadius: '8px',
                                    fontSize: '1rem', fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s ease', opacity: loading ? 0.8 : 1, marginTop: '16px',
                                    boxShadow: '0 4px 14px rgba(27, 67, 50, 0.2)'
                                }}
                            >
                                {loading ? 'Processing Securely...' : 'Place Order Securely'}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '24px', fontWeight: '600' }}>Order Summary</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                            {items.map((item, idx) => {
                                let safeThumb = 'https://via.placeholder.com/64';
                                if (item.product?.image) {
                                    safeThumb = typeof item.product.image === 'string' ? item.product.image : (item.product.image.url || safeThumb);
                                } else if (item.product?.images?.[0]) {
                                    safeThumb = typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url;
                                }

                                return (
                                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                            <img src={safeThumb} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: '#0f172a', fontWeight: '500', lineHeight: '1.3' }}>{item.product.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.qty}</p>
                                        </div>
                                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                                            ₹{((typeof item.product?.price === 'number' ? item.product.price : parseFloat((item.product?.price || "0").replace(/[^0-9.-]+/g, ""))) * item.qty).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: '#475569' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Subtotal</span>
                                <span style={{ color: '#0f172a', fontWeight: '500' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Estimated Tax</span>
                                <span>Included</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Shipping</span>
                                <span style={{ color: '#059669', fontWeight: '500' }}>Free</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed #cbd5e1', fontSize: '1.25rem', fontWeight: '700', color: '#1b4332' }}>
                            <span>Total Due</span>
                            <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default Checkout;
