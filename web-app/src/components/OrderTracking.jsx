import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import api from '../utils/api.js';
import Navbar from './Navbar';
import Footer from './Footer';

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
            <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
                <Navbar />
                <div className="flex flex-1 items-center justify-center">
                    <div className="border-t-accent h-12 w-12 animate-spin rounded-full border-4 border-slate-200"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
                <Navbar />
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <FileText size={48} className="mb-4 text-slate-300" />
                    <h2 className="text-2xl font-extrabold text-slate-900">Order Not Found</h2>
                </div>
                <Footer />
            </div>
        );
    }

    const steps = [
        {
            id: 'PENDING',
            label: 'Order Placed',
            icon: Package,
            description: 'We have received your order.',
        },
        {
            id: 'PROCESSING',
            label: 'Processing',
            icon: Clock,
            description: 'Your order is being packed.',
        },
        { id: 'SHIPPED', label: 'Shipped', icon: Truck, description: 'Your order is on the way!' },
        {
            id: 'DELIVERED',
            label: 'Delivered',
            icon: CheckCircle2,
            description: 'Package has been delivered.',
        },
    ];

    const isCancelled = order.status === 'CANCELLED';
    const currentStepIndex = isCancelled ? -1 : steps.findIndex((s) => s.id === order.status);

    return (
        <div className="selection:bg-accent/30 flex min-h-screen flex-col bg-slate-50 font-sans">
            <Navbar />
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <Link
                    to="/orders"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-900"
                >
                    <ArrowLeft size={16} /> Back to Orders
                </Link>

                <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
                            Track Order
                        </h2>
                        <p className="font-medium text-slate-500">
                            Order ID:{' '}
                            <strong className="font-mono tracking-wider text-slate-900">
                                {order.orderId}
                            </strong>
                        </p>
                    </div>
                    {order.tracking?.trackingNumber && (
                        <div className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-right shadow-sm sm:w-auto">
                            <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                Courier: {order.tracking.courierName}
                            </span>
                            {order.tracking.trackingUrl ? (
                                <a
                                    href={order.tracking.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent hover:text-accent-glow inline-flex items-center gap-2 font-bold transition-colors"
                                >
                                    AWB: {order.tracking.trackingNumber}{' '}
                                    <span className="text-lg">↗</span>
                                </a>
                            ) : (
                                <span className="font-bold text-slate-900">
                                    AWB: {order.tracking.trackingNumber}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="mb-8 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm md:p-12">
                    {isCancelled ? (
                        <div className="text-danger py-8 text-center">
                            <XCircle size={64} className="mx-auto mb-4 opacity-80" />
                            <h3 className="mb-2 text-2xl font-extrabold">Order Cancelled</h3>
                            <p className="font-medium opacity-80">
                                This order has been cancelled and will not be shipped.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                const isLast = index === steps.length - 1;

                                return (
                                    <div key={step.id} className="relative flex gap-6">
                                        {!isLast && (
                                            <div
                                                className={`absolute top-12 left-[1.35rem] z-0 h-[calc(100%-1rem)] w-0.5 transition-colors duration-500 ${index < currentStepIndex ? 'bg-accent' : 'bg-slate-100'}`}
                                            ></div>
                                        )}

                                        <div
                                            className={`z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 transition-all duration-500 ${
                                                isCurrent
                                                    ? 'bg-accent border-accent shadow-accent/30 scale-110 text-white shadow-lg'
                                                    : isCompleted
                                                      ? 'bg-accent border-accent text-white'
                                                      : 'border-slate-200 bg-white text-slate-300'
                                            }`}
                                        >
                                            <step.icon
                                                size={20}
                                                strokeWidth={isCurrent || isCompleted ? 3 : 2}
                                            />
                                        </div>

                                        <div className="pt-2 pb-12">
                                            <h4
                                                className={`mb-1 text-lg font-bold transition-colors ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}
                                            >
                                                {step.label}
                                            </h4>
                                            <p className="mb-2 text-sm font-medium text-slate-500">
                                                {step.description}
                                            </p>

                                            {isCompleted &&
                                                order.statusHistory?.find(
                                                    (h) => h.status === step.id
                                                ) && (
                                                    <span className="inline-block rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-400">
                                                        {new Date(
                                                            order.statusHistory.find(
                                                                (h) => h.status === step.id
                                                            ).date
                                                        ).toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm md:p-12">
                    <h3 className="mb-6 border-b border-slate-100 pb-6 text-xl font-extrabold text-slate-900">
                        Order Details
                    </h3>
                    <div className="space-y-4">
                        {order.items.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between text-sm font-medium"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 font-extrabold text-slate-600">
                                        {item.qty}x
                                    </span>
                                    <span className="max-w-[200px] truncate text-slate-700 sm:max-w-sm">
                                        {item.sku.length > 40
                                            ? `${item.sku.substring(0, 40)}...`
                                            : item.sku}
                                    </span>
                                </div>
                                <div className="font-extrabold text-slate-900">
                                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex items-center justify-between border-t border-dashed border-slate-200 pt-8">
                        <span className="text-lg font-extrabold text-slate-900">Total Paid</span>
                        <span className="text-accent text-2xl font-black tracking-tight">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderTracking;
