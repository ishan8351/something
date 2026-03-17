import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Download,
    CheckCircle,
    Loader2,
} from 'lucide-react';
import api from '../../utils/api.js';

const AdminInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterOption, setFilterOption] = useState('ALL');
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, filterOption]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/invoices/admin/all', {
                params: { page, limit: 10, search: debouncedSearch, status: filterOption },
            });
            setInvoices(res.data.data.data);
            setTotalPages(res.data.data.pagination.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [page, debouncedSearch, filterOption]);

    const markAsPaid = async (id) => {
        if (!window.confirm('Mark this invoice as PAID? This will also update the Order status.'))
            return;
        try {
            await api.put(`/invoices/${id}/manual-payment`);
            fetchInvoices();
        } catch (err) {
            alert('Failed to update invoice status');
        }
    };

    const downloadPDF = async (id, invoiceNumber) => {
        setDownloadingId(id);
        try {
            const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Tax_Invoice_${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to download PDF');
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
                <div className="focus-within:border-accent focus-within:ring-accent flex flex-1 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:ring-1">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Invoice #, Company, or GSTIN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ml-3 w-full border-none text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                </div>
                <div className="focus-within:border-accent focus-within:ring-accent flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:ring-1">
                    <Filter size={18} className="mr-2 text-slate-400" />
                    <select
                        value={filterOption}
                        onChange={(e) => setFilterOption(e.target.value)}
                        className="cursor-pointer border-none bg-transparent py-2.5 text-sm font-bold text-slate-700 outline-none"
                    >
                        <option value="ALL">All Invoices</option>
                        <option value="UNPAID">Unpaid</option>
                        <option value="PAID">Paid</option>
                        <option value="OVERDUE">Overdue</option>
                    </select>
                </div>
            </div>

            <div className="mb-6 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                <div className="relative min-h-[300px] overflow-x-auto">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 text-slate-400 backdrop-blur-sm">
                            <div className="border-t-accent mb-2 h-8 w-8 animate-spin rounded-full border-4 border-slate-200"></div>
                        </div>
                    )}
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Invoice Details
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    B2B Client
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Amount
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Terms
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Status
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices.map((inv) => {
                                const isOverdue =
                                    new Date(inv.dueDate) < new Date() && inv.status === 'UNPAID';
                                return (
                                    <tr
                                        key={inv._id}
                                        className="transition-colors hover:bg-slate-50/50"
                                    >
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="font-bold text-slate-900">
                                                {inv.invoiceNumber}
                                            </div>
                                            <div className="text-[10px] font-bold tracking-wider text-slate-400">
                                                {new Date(inv.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="font-bold text-slate-800">
                                                {inv.buyerDetails?.companyName}
                                            </div>
                                            <div className="text-[11px] font-bold text-slate-500">
                                                GSTIN: {inv.buyerDetails?.gstin}
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="font-black text-slate-900">
                                                ₹
                                                {(
                                                    inv.grandTotal || inv.totalAmount
                                                )?.toLocaleString('en-IN')}
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="text-xs font-bold text-slate-700">
                                                {inv.paymentTerms?.replace('_', ' ')}
                                            </div>
                                            <div
                                                className={`text-[10px] font-bold ${isOverdue ? 'text-danger' : 'text-slate-400'}`}
                                            >
                                                Due: {new Date(inv.dueDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-widest uppercase ${
                                                    inv.status === 'PAID'
                                                        ? 'bg-green-100 text-green-700'
                                                        : inv.status === 'CANCELLED'
                                                          ? 'bg-red-100 text-red-700'
                                                          : isOverdue
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                }`}
                                            >
                                                {inv.status === 'CANCELLED'
                                                    ? 'CANCELLED'
                                                    : isOverdue
                                                      ? 'OVERDUE'
                                                      : inv.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        downloadPDF(inv._id, inv.invoiceNumber)
                                                    }
                                                    disabled={downloadingId === inv._id}
                                                    title="Download Tax Invoice PDF"
                                                    className="text-accent bg-accent/10 hover:bg-accent rounded-lg p-2 transition-colors hover:text-white disabled:opacity-50"
                                                >
                                                    {downloadingId === inv._id ? (
                                                        <Loader2
                                                            size={16}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Download size={16} />
                                                    )}
                                                </button>

                                                {inv.status === 'UNPAID' && (
                                                    <button
                                                        onClick={() => markAsPaid(inv._id)}
                                                        title="Mark as Paid"
                                                        className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-green-100 hover:text-green-700"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                >
                    <ChevronLeft size={16} /> Prev
                </button>
                <span className="text-sm font-bold text-slate-500">
                    Page <span className="text-slate-900">{page}</span> of {totalPages || 1}
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                    className="flex items-center gap-1 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </>
    );
};

export default AdminInvoices;
