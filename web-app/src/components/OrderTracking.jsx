import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle, MapPin } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    withCredentials: true
});

const OrderTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data.data);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, navigate]);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fafafa' }}>
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#1b4332', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fafafa' }}>
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h2>Order Not Found</h2>
                </div>
                <Footer />
            </div>
        );
    }

    // Define the standard steps
    const steps = [
        { id: 'PENDING', label: 'Order Placed', icon: Package, description: 'We have received your order.' },
        { id: 'PROCESSING', label: 'Processing', icon: Clock, description: 'Your order is being packed.' },
        { id: 'SHIPPED', label: 'Shipped', icon: Truck, description: 'Your order is on the way!' },
        { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2, description: 'Package has been delivered.' }
    ];

    const isCancelled = order.status === 'CANCELLED';
    const currentStepIndex = isCancelled ? -1 : steps.findIndex(s => s.id === order.status);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fafafa' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                
                <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#64748b', marginBottom: '24px', fontWeight: '500' }}>
                    <ArrowLeft size={16} /> Back to Orders
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 8px 0' }}>Track Order</h2>
                        <p style={{ margin: 0, color: '#64748b' }}>Order ID: <strong style={{ color: '#0f172a' }}>{order.orderId}</strong></p>
                    </div>
                    {order.tracking?.trackingNumber && (
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Courier: {order.tracking.courierName}</span>
                            <div style={{ fontWeight: '600', color: '#1b4332' }}>AWB: {order.tracking.trackingNumber}</div>
                        </div>
                    )}
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '32px' }}>
                    {isCancelled ? (
                        <div style={{ textAlign: 'center', color: '#b91c1c', padding: '20px' }}>
                            <XCircle size={48} style={{ marginBottom: '16px' }} />
                            <h3>Order Cancelled</h3>
                            <p>This order has been cancelled and will not be shipped.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {steps.map((step, index) => {
                                // Logic to color the timeline
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                const isLast = index === steps.length - 1;

                                const color = isCompleted ? '#1b4332' : '#cbd5e1';
                                const bgColor = isCompleted ? '#f0fdf4' : '#f8fafc';

                                return (
                                    <div key={step.id} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                                        {/* Vertical Line */}
                                        {!isLast && (
                                            <div style={{
                                                position: 'absolute', top: '40px', left: '19px', width: '2px', height: 'calc(100% - 20px)',
                                                background: index < currentStepIndex ? '#1b4332' : '#e2e8f0', zIndex: 1
                                            }}></div>
                                        )}

                                        {/* Circle Icon */}
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%', background: isCurrent ? '#1b4332' : bgColor,
                                            border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            zIndex: 2, flexShrink: 0, transition: 'all 0.3s ease'
                                        }}>
                                            <step.icon size={20} color={isCurrent ? '#fff' : color} />
                                        </div>

                                        {/* Text Details */}
                                        <div style={{ paddingBottom: '40px', paddingTop: '8px' }}>
                                            <h4 style={{ margin: '0 0 4px 0', color: isCompleted ? '#0f172a' : '#94a3b8', fontSize: '1.1rem' }}>{step.label}</h4>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{step.description}</p>
                                            
                                            {/* Show history date if available (from new schema) */}
                                            {isCompleted && order.statusHistory?.find(h => h.status === step.id) && (
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                                                    {new Date(order.statusHistory.find(h => h.status === step.id).date).toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: '0 0 20px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>Order Details</h3>
                    {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                            <div>
                                <strong style={{ color: '#0f172a' }}>{item.qty}x</strong> {item.sku.substring(0, 30)}...
                            </div>
                            <div style={{ color: '#0f172a', fontWeight: '500' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1', fontWeight: '700', fontSize: '1.1rem' }}>
                        <span>Total Paid</span>
                        <span style={{ color: '#1b4332' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default OrderTracking;
