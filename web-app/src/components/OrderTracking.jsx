import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    Download,
    ShieldCheck,
    Building2,
} from 'lucide-react';
import api from '../utils/api.js';

const OrderTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [invoiceId, setInvoiceId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const orderRes = await api.get(`/orders/${id}`);
                setOrder(orderRes.data.data);

                const invoicesRes = await api.get('/invoices');
                const matchingInvoice = invoicesRes.data.data.find(
                    (inv) => inv.orderId?._id === id || inv.orderId === id
                );
                if (matchingInvoice) {
                    setInvoiceId(matchingInvoice._id);
                }
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderData();
    }, [id, navigate]);

    const handleDownloadPdf = async () => {
        if (!invoiceId) return;
        setDownloading(true);
        try {
            const response = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Tax_Invoice_ORD_${order.orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download PDF:', error);
            alert('Failed to download invoice. Please try again later.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center p-12">
                <div className="border-t-primary h-12 w-12 animate-spin rounded-full border-4 border-slate-200"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
                <FileText size={48} className="mb-4 text-slate-300" />
                <h2 className="text-2xl font-extrabold text-slate-900">Order Not Found</h2>
                <Link to="/orders" className="text-primary mt-4 font-bold hover:underline">
                    Return to Orders
                </Link>
            </div>
        );
    }

    const steps = [
        {
            id: 'PENDING',
            label: 'PO Received',
            icon: Package,
            description: 'Purchase order logged in system.',
        },
        {
            id: 'PROCESSING',
            label: 'In Production / Packing',
            icon: Clock,
            description: 'Inventory allocated and being prepared.',
        },
        {
            id: 'SHIPPED',
            label: 'Dispatched',
            icon: Truck,
            description: 'Handed over to logistics partner.',
        },
        {
            id: 'DELIVERED',
            label: 'Delivered',
            icon: CheckCircle2,
            description: 'Goods received at destination.',
        },
    ];

    const isCancelled = order.status === 'CANCELLED';
    const currentStepIndex = isCancelled ? -1 : steps.findIndex((s) => s.id === order.status);

    return (
        <main className="selection:bg-primary/30 mx-auto w-full max-w-5xl flex-1 px-4 py-8 font-sans text-slate-900 sm:px-6 lg:px-8 lg:py-12">
            <Link
                to="/orders"
                className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-900"
            >
                <ArrowLeft size={16} /> Back to Procurement History
            </Link>

            {}
            <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        Consignment Status
                    </h2>
                    <div className="flex items-center gap-3">
                        <p className="font-medium text-slate-500">
                            Order Ref:{' '}
                            <strong className="font-mono tracking-wider text-slate-900">
                                {order.orderId}
                            </strong>
                        </p>
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-200"></span>
                        <p className="font-medium text-slate-500">
                            Placed:{' '}
                            <strong className="text-slate-900">
                                {new Date(order.orderDate || order.createdAt).toLocaleDateString(
                                    'en-IN'
                                )}
                            </strong>
                        </p>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                    {invoiceId && (
                        <button
                            onClick={handleDownloadPdf}
                            disabled={downloading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
                        >
                            {downloading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                            ) : (
                                <Download size={16} />
                            )}
                            Tax Invoice
                        </button>
                    )}
                    {order.tracking?.trackingNumber && (
                        <div className="border-primary/20 bg-primary/5 rounded-xl border px-5 py-2.5 text-center shadow-sm sm:text-right">
                            <span className="text-primary mb-0.5 block text-[10px] font-bold tracking-widest uppercase">
                                Logistics: {order.tracking.courierName || 'Standard Surface'}
                            </span>
                            {order.tracking.trackingUrl ? (
                                <a
                                    href={order.tracking.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary-light inline-flex items-center gap-1.5 font-bold transition-colors"
                                >
                                    LR / AWB:{' '}
                                    <span className="font-mono">
                                        {order.tracking.trackingNumber}
                                    </span>{' '}
                                    <span className="text-lg leading-none">↗</span>
                                </a>
                            ) : (
                                <span className="font-mono font-bold text-slate-900">
                                    LR / AWB: {order.tracking.trackingNumber}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {}
            <div className="mb-8 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
                {isCancelled ? (
                    <div className="rounded-3xl border border-red-100 bg-red-50 py-8 text-center text-red-600">
                        <XCircle size={56} className="mx-auto mb-4 opacity-90" />
                        <h3 className="mb-2 text-2xl font-extrabold">Purchase Order Cancelled</h3>
                        <p className="mx-auto max-w-md font-medium opacity-80">
                            This consignment has been halted. Any associated pre-payments or wallet
                            deductions have been automatically refunded to your account.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const isLast = index === steps.length - 1;
                            const historyMatch = order.statusHistory?.find(
                                (h) => h.status === step.id
                            );

                            return (
                                <div key={step.id} className="relative flex gap-6">
                                    {!isLast && (
                                        <div
                                            className={`absolute top-12 left-[1.35rem] z-0 h-[calc(100%-1rem)] w-0.5 transition-colors duration-500 ${index < currentStepIndex ? 'bg-primary' : 'bg-slate-100'}`}
                                        ></div>
                                    )}

                                    <div
                                        className={`z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 transition-all duration-500 ${
                                            isCurrent
                                                ? 'bg-primary border-primary shadow-primary/30 scale-110 text-white shadow-lg'
                                                : isCompleted
                                                  ? 'bg-primary border-primary text-white'
                                                  : 'border-slate-200 bg-white text-slate-300'
                                        }`}
                                    >
                                        <step.icon
                                            size={20}
                                            strokeWidth={isCurrent || isCompleted ? 3 : 2}
                                        />
                                    </div>

                                    <div className="w-full pt-2 pb-12">
                                        <div className="mb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <h4
                                                className={`text-lg font-bold transition-colors ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}
                                            >
                                                {step.label}
                                            </h4>
                                            {historyMatch && (
                                                <span className="mt-1 font-mono text-xs font-bold text-slate-400 sm:mt-0">
                                                    {new Date(historyMatch.date).toLocaleString(
                                                        'en-IN',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        }
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-slate-500">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {}
                <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-10 lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-6">
                        <h3 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                            <Package size={24} className="text-slate-400" /> Commercial Manifest
                        </h3>
                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold tracking-wider text-slate-600 uppercase">
                            {order.items?.length || 0} SKU(s)
                        </span>
                    </div>

                    <div className="space-y-4">
                        {order.items?.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt="SKU"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Package size={20} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="line-clamp-1 font-bold text-slate-900">
                                            {item.title}
                                        </h4>
                                        <div className="mt-1 flex items-center gap-3 text-xs font-medium text-slate-500">
                                            <span>
                                                SKU:{' '}
                                                <span className="font-mono text-slate-700">
                                                    {item.sku}
                                                </span>
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                            <span>
                                                HSN:{' '}
                                                <span className="font-mono text-slate-700">
                                                    {item.hsnCode || 'N/A'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center">
                                    <div className="text-sm font-bold text-slate-700">
                                        {item.qty} Unit(s) × ₹
                                        {item.basePrice?.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </div>
                                    <div className="font-extrabold text-slate-900">
                                        ₹
                                        {item.totalItemPrice?.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {}
                <div className="h-fit rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
                    <h3 className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-6 text-xl font-extrabold text-slate-900">
                        <ShieldCheck size={24} className="text-green-500" /> Settlement
                    </h3>

                    <div className="mb-6 space-y-4 text-sm font-medium text-slate-600">
                        <div className="flex justify-between">
                            <span>Payment Terms</span>
                            <span className="font-bold text-slate-900">
                                {(order.paymentTerms || 'DUE_ON_RECEIPT').replace(/_/g, ' ')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Method</span>
                            <span className="font-bold text-slate-900">{order.paymentMethod}</span>
                        </div>
                        <div className="border-t border-dashed border-slate-100 pt-4"></div>
                        <div className="flex justify-between">
                            <span>Taxable Value</span>
                            <span className="font-bold text-slate-900">
                                ₹
                                {order.subTotal?.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax Amount (GST)</span>
                            <span className="font-bold text-slate-900">
                                ₹
                                {order.taxTotal?.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-5 text-white">
                        <span className="text-sm font-bold text-slate-300">Total Value</span>
                        <span className="text-xl font-black tracking-tight">
                            ₹
                            {order.grandTotal?.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                            }) || '0.00'}
                        </span>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default OrderTracking;
