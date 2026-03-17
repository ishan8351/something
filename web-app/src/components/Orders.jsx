import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Download, Clock, CheckCircle2, ArrowLeft, Box } from 'lucide-react';
import api from '../utils/api.js';
import Navbar from './Navbar';
import Footer from './Footer';

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
        <div className="selection:bg-accent/30 flex min-h-screen flex-col bg-slate-50 font-sans">
            <Navbar />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        My Orders & Invoices
                    </h1>
                    <Link
                        to="/my-account"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft size={16} /> Back to Account
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="border-t-accent mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200"></div>
                        <p className="font-medium">Loading your history...</p>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="flex flex-col items-center rounded-[2.5rem] border border-slate-100 bg-white p-12 text-center shadow-sm">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                            <Box size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="mb-2 text-2xl font-extrabold text-slate-900">
                            No Orders Found
                        </h3>
                        <p className="mb-8 font-medium text-slate-500">
                            You haven't placed any orders or topped up your wallet yet.
                        </p>
                        <Link
                            to="/"
                            className="hover:bg-accent hover:shadow-accent/30 rounded-full bg-slate-900 px-8 py-4 font-bold tracking-wide text-white shadow-md transition-all"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {invoices.map((inv) => {
                            const isPaid = inv.status === 'PAID';
                            const isOrder = inv.invoiceType === 'ORDER_BILL';
                            const orderStatus = inv.orderId?.status;
                            const isPendingTransfer =
                                inv.status === 'UNPAID' && inv.paymentMethod === 'BANK_TRANSFER';

                            return (
                                <div
                                    key={inv._id}
                                    className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-center md:p-8"
                                >
                                    <div className="w-full flex-1">
                                        <div className="mb-4 flex flex-wrap items-center gap-3">
                                            <h3 className="text-xl font-extrabold text-slate-900">
                                                {isOrder
                                                    ? `Order #${inv.orderId?.orderId || 'N/A'}`
                                                    : 'Wallet Top-up'}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold tracking-wider uppercase ${isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                                            >
                                                {isPaid ? (
                                                    <CheckCircle2 size={12} />
                                                ) : (
                                                    <Clock size={12} />
                                                )}{' '}
                                                {inv.status}
                                            </span>
                                            {isOrder && orderStatus && (
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tracking-wider text-slate-600 uppercase">
                                                    {orderStatus}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                                            <div>
                                                <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                    Amount
                                                </span>
                                                <strong className="text-lg font-extrabold text-slate-900">
                                                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                                                </strong>
                                            </div>
                                            <div>
                                                <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                    Date Issued
                                                </span>
                                                <span className="font-semibold text-slate-700">
                                                    {new Date(inv.createdAt).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                    Payment Terms
                                                </span>
                                                <span className="font-semibold text-slate-700">
                                                    {inv.paymentTerms.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row md:w-auto md:flex-col md:items-end">
                                        <a
                                            href={`${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/invoices/${inv._id}/pdf`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
                                        >
                                            <Download size={16} /> Download PDF
                                        </a>

                                        {isOrder && (
                                            <Link
                                                to={`/orders/${inv.orderId._id}/track`}
                                                className="hover:bg-accent flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-sm transition-colors"
                                            >
                                                <Package size={16} /> Track Order
                                            </Link>
                                        )}

                                        {isPendingTransfer && (
                                            <div className="text-danger bg-danger/10 mt-2 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold md:justify-end">
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
