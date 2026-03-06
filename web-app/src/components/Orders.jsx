import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Download, Clock, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import './Auth.css';
import Navbar from './Navbar';
import Footer from './Footer';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    withCredentials: true
});

const Orders = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/invoices');
                setInvoices(res.data.data);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fafafa' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '40px 20px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: '700', margin: 0 }}>My Orders & Invoices</h2>
                    <Link to="/my-account" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>
                        <ArrowLeft size={16} /> Back to Account
                    </Link>
                </div>

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#1b4332', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                        Loading your history...
                    </div>
                ) : invoices.length === 0 ? (
                    <div style={{ background: '#fff', padding: '60px 40px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <Package size={64} color="#cbd5e1" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '8px' }}>No Orders Found</h3>
                        <p style={{ color: '#64748b', marginBottom: '24px' }}>You haven't placed any orders or topped up your wallet yet.</p>
                        <Link to="/" style={{ display: 'inline-block', background: '#1b4332', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {invoices.map(inv => {
                            const isPaid = inv.status === 'PAID';
                            const isOrder = inv.invoiceType === 'ORDER_BILL';
                            const orderStatus = inv.orderId?.status;
                            const isPendingTransfer = inv.status === 'UNPAID' && inv.paymentMethod === 'BANK_TRANSFER';

                            return (
                                <div key={inv._id} style={{
                                    background: '#fff', padding: '24px 32px', borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
                                }}>

                                    <div style={{ flex: '1 1 300px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '600' }}>
                                                {isOrder ? `Order #${inv.orderId?.orderId || 'N/A'}` : 'Wallet Top-up'}
                                            </h3>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                background: isPaid ? '#dcfce7' : '#fef9c3',
                                                color: isPaid ? '#166534' : '#854d0e',
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700'
                                            }}>
                                                {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                {inv.status}
                                            </span>
                                            {isOrder && orderStatus && (
                                                <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontWeight: '500' }}>
                                                    {orderStatus}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', color: '#475569', fontSize: '0.875rem' }}>
                                            <div>
                                                <span style={{ block: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</span><br />
                                                <strong style={{ color: '#0f172a', fontSize: '1rem' }}>₹{inv.totalAmount.toLocaleString('en-IN')}</strong>
                                            </div>
                                            <div>
                                                <span style={{ block: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Issued</span><br />
                                                {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div>
                                                <span style={{ block: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Terms</span><br />
                                                {inv.paymentTerms.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                        <a
                                            href={`http://localhost:8000/api/v1/invoices/${inv._id}/pdf`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                background: '#fff', color: '#1b4332', padding: '10px 20px',
                                                borderRadius: '8px', textDecoration: 'none', fontWeight: '600',
                                                border: '1px solid #1b4332', transition: 'all 0.2s', cursor: 'pointer'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.background = '#f0fdf4'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                                        >
                                            <Download size={18} /> Download PDF
                                        </a>

                                        {isPendingTransfer && (
                                            <div style={{ fontSize: '0.8rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                                <Clock size={14} /> Action Required: Transfer Funds
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Orders;
