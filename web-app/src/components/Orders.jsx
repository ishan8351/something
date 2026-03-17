import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Package,
    Download,
    Clock,
    CheckCircle2,
    ArrowLeft,
    Box,
    RefreshCw,
    Filter,
    AlertCircle,
    Search,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import api from '../utils/api.js';
import { useCartStore } from '../store/cartStore';

const Orders = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedInvoices, setExpandedInvoices] = useState(new Set());
    const [isReordering, setIsReordering] = useState(false);

    const navigate = useNavigate();
    const addBulkToCart = useCartStore((state) => state.addBulkToCart);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/invoices');
                setInvoices(Array.isArray(res.data?.data) ? res.data.data : []);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    const outstandingBalance = invoices
        .filter((inv) => inv.status === 'UNPAID')
        .reduce((sum, inv) => sum + (inv.grandTotal || inv.totalAmount || inv.amount || 0), 0);

    const toggleExpand = (invoiceId) => {
        const newExpanded = new Set(expandedInvoices);
        if (newExpanded.has(invoiceId)) {
            newExpanded.delete(invoiceId);
        } else {
            newExpanded.add(invoiceId);
        }
        setExpandedInvoices(newExpanded);
    };

    const processedInvoices = invoices.filter((inv) => {
        if (filter === 'UNPAID' && inv.status !== 'UNPAID') return false;
        if (filter === 'PAID' && inv.status !== 'PAID') return false;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const invNo = (inv.invoiceNumber || '').toLowerCase();
            const ordNo = (inv.orderId?.orderId || '').toLowerCase();
            const itemMatch = inv.orderId?.items?.some((i) =>
                (i.title || i.product?.title || '').toLowerCase().includes(term)
            );

            if (!invNo.includes(term) && !ordNo.includes(term) && !itemMatch) {
                return false;
            }
        }
        return true;
    });

    const handleExportCSV = () => {
        const headers = [
            'Date',
            'Invoice No',
            'Order Ref',
            'Payment Terms',
            'Status',
            'Total Amount (INR)',
        ];

        const rows = processedInvoices.map((inv) => {
            const date = inv.createdAt
                ? new Date(inv.createdAt).toLocaleDateString('en-IN')
                : 'N/A';
            const invNo = inv.invoiceNumber || 'N/A';
            const orderRef = inv.orderId?.orderId || 'N/A';
            const terms = (inv.paymentTerms || 'N/A').replace(/_/g, ' ');
            const status = inv.status || 'UNKNOWN';
            const total = inv.grandTotal || inv.totalAmount || inv.amount || 0;

            return `"${date}","${invNo}","${orderRef}","${terms}","${status}","${total}"`;
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Statement_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPdf = async (invoiceId, invoiceNumber) => {
        try {
            const response = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Tax_Invoice_${invoiceNumber || invoiceId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to download invoice. Please try again later.');
        }
    };

    const handleReorder = async (invoice) => {
        if (!invoice.orderId || !invoice.orderId.items) {
            alert('Cannot reorder: Order details are missing.');
            return;
        }

        setIsReordering(true);
        try {
            const itemsToReorder = await Promise.all(
                invoice.orderId.items.map(async (item) => {
                    let productData = item.product || item.productId;
                    let productId = null;

                    if (productData && typeof productData === 'object') {
                        productId = productData._id || productData.id;
                    } else if (typeof productData === 'string') {
                        productId = productData;
                    }

                    if (!productId || productId === 'undefined')
                        throw new Error('Corrupted Product ID');

                    if (typeof productData === 'string' || !productData.title) {
                        try {
                            const prodRes = await api.get(`/products/${productId}`);
                            productData = prodRes.data?.data || prodRes.data;
                        } catch (fetchErr) {
                            if (fetchErr.response?.status === 404) {
                                throw new Error('An item in this order is no longer available.');
                            }
                            throw fetchErr;
                        }
                    }

                    return {
                        product: { ...productData, id: productData._id || productId },
                        quantity: item.quantity || 1,
                    };
                })
            );

            addBulkToCart(itemsToReorder);
            alert('Items successfully added to your Bulk Procurement Cart!');
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || error.message || 'Unknown error occurred.';
            alert(`Failed to reorder: ${errorMsg}`);
        } finally {
            setIsReordering(false);
        }
    };

    return (
        <div className="selection:bg-accent/30 mx-auto w-full max-w-6xl flex-1 px-4 py-8 font-sans text-slate-900 sm:px-6 lg:px-8 lg:py-12">
            {}
            <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <Link
                        to="/my-account"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft size={16} /> Back to Account
                    </Link>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Invoices & Billing
                    </h1>
                </div>

                <div className="flex items-center gap-6 rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <span className="mb-1 block text-xs font-bold tracking-widest text-red-500 uppercase">
                            Total Outstanding
                        </span>
                        <div className="text-2xl font-black text-red-700">
                            ₹{outstandingBalance.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
            </div>

            {}
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative max-w-md flex-1">
                        <Search
                            size={18}
                            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Invoice No, or Product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="focus:border-accent focus:ring-accent w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm font-medium text-slate-900 outline-none focus:ring-1"
                        />
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <Filter size={16} className="ml-3 text-slate-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="cursor-pointer bg-transparent py-1.5 pr-8 pl-2 text-sm font-bold text-slate-700 outline-none focus:ring-0"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="UNPAID">Action Required (Unpaid)</option>
                            <option value="PAID">Paid & Completed</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleExportCSV}
                    disabled={processedInvoices.length === 0}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-200 disabled:opacity-50"
                >
                    <FileSpreadsheet size={18} /> Export CSV
                </button>
            </div>

            {}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="border-t-accent mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200"></div>
                    <p className="font-medium">Loading your corporate ledger...</p>
                </div>
            ) : processedInvoices.length === 0 ? (
                <div className="flex flex-col items-center rounded-[2.5rem] border border-slate-100 bg-white p-12 text-center shadow-sm">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                        <Search size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className="mb-2 text-2xl font-extrabold text-slate-900">
                        No matching invoices
                    </h3>
                    <p className="mb-8 font-medium text-slate-500">
                        Try adjusting your search terms or filters.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {processedInvoices.map((inv) => {
                        const isPaid = inv.status === 'PAID';
                        const isOrder = inv.invoiceType === 'ORDER_BILL';
                        const safeAmount = inv.grandTotal || inv.totalAmount || inv.amount || 0;
                        const isExpanded = expandedInvoices.has(inv._id);

                        return (
                            <div
                                key={inv._id}
                                className={`overflow-hidden rounded-2xl border ${!isPaid ? 'border-red-200 bg-white' : 'border-slate-200 bg-white'} shadow-sm transition-all hover:shadow-md`}
                            >
                                {}
                                <div className="flex flex-col items-start gap-6 p-6 md:flex-row md:items-center md:justify-between">
                                    <div className="w-full flex-1">
                                        <div className="mb-3 flex flex-wrap items-center gap-3">
                                            <h3 className="text-lg font-extrabold text-slate-900">
                                                {inv.invoiceNumber ||
                                                    `Invoice #${inv._id.substring(0, 8)}`}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                            >
                                                {isPaid ? (
                                                    <CheckCircle2 size={12} />
                                                ) : (
                                                    <AlertCircle size={12} />
                                                )}
                                                {inv.status || 'UNKNOWN'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                            <div>
                                                <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                    Amount
                                                </span>
                                                <strong className="text-base font-extrabold text-slate-900">
                                                    ₹{safeAmount.toLocaleString('en-IN')}
                                                </strong>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                    Date
                                                </span>
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {inv.createdAt
                                                        ? new Date(
                                                              inv.createdAt
                                                          ).toLocaleDateString('en-US', {
                                                              month: 'short',
                                                              day: 'numeric',
                                                              year: 'numeric',
                                                          })
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                    Order Ref
                                                </span>
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {inv.orderId?.orderId || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                    Terms
                                                </span>
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {(inv.paymentTerms || 'N/A').replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {}
                                    <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:flex-nowrap">
                                        {isOrder && (
                                            <button
                                                onClick={() => toggleExpand(inv._id)}
                                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp size={16} />
                                                ) : (
                                                    <ChevronDown size={16} />
                                                )}
                                                Items
                                            </button>
                                        )}
                                        <button
                                            onClick={() =>
                                                handleDownloadPdf(inv._id, inv.invoiceNumber)
                                            }
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                                        >
                                            <Download size={16} /> PDF
                                        </button>
                                        {isOrder && (
                                            <button
                                                onClick={() => handleReorder(inv)}
                                                disabled={isReordering}
                                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-70"
                                            >
                                                <RefreshCw
                                                    size={14}
                                                    className={isReordering ? 'animate-spin' : ''}
                                                />
                                                Reorder
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {}
                                {isExpanded && isOrder && inv.orderId?.items && (
                                    <div className="border-t border-slate-100 bg-slate-50 p-6">
                                        <h4 className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
                                            Itemized Breakdown
                                        </h4>
                                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                                            <table className="w-full text-left text-sm">
                                                <thead className="border-b border-slate-200 bg-slate-50">
                                                    <tr>
                                                        <th className="px-4 py-3 font-bold text-slate-700">
                                                            Product
                                                        </th>
                                                        <th className="px-4 py-3 text-center font-bold text-slate-700">
                                                            HSN
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-bold text-slate-700">
                                                            Qty
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-bold text-slate-700">
                                                            Rate
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-bold text-slate-700">
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {inv.orderId.items.map((item, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className="hover:bg-slate-50/50"
                                                        >
                                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                                {item.title ||
                                                                    item.product?.title ||
                                                                    'Unknown Product'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-slate-500">
                                                                {item.hsnCode || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-semibold text-slate-700">
                                                                {item.quantity || item.qty}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-slate-600">
                                                                ₹
                                                                {(
                                                                    item.basePrice ||
                                                                    item.price ||
                                                                    0
                                                                ).toLocaleString('en-IN')}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-bold text-slate-900">
                                                                ₹
                                                                {(
                                                                    item.totalItemPrice ||
                                                                    (item.price || 0) *
                                                                        (item.quantity || 1)
                                                                ).toLocaleString('en-IN')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Orders;
