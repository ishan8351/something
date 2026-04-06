import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
    pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    failed: 'bg-red-100 text-red-700 border border-red-200',
};

const AdminRemittances = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionModal, setActionModal] = useState(null); // { withdrawal, mode: 'approve'|'reject' }
    const [txnId, setTxnId] = useState('');
    const [transferredAmount, setTransferredAmount] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await api.get('/wallet/admin/withdrawals?limit=100');
            setWithdrawals(res.data?.data?.withdrawals || []);
        } catch (error) {
            toast.error('Failed to load withdrawal requests');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (withdrawal, mode) => {
        setActionModal({ withdrawal, mode });
        setTxnId('');
        setTransferredAmount(withdrawal.requestedAmount?.toString() || '');
        setReason('');
    };

    const closeModal = () => {
        setActionModal(null);
        setTxnId('');
        setTransferredAmount('');
        setReason('');
    };

    const handleAction = async (e) => {
        e.preventDefault();
        if (!actionModal) return;

        const { withdrawal, mode } = actionModal;
        const status = mode === 'approve' ? 'success' : 'failed';

        setIsSubmitting(true);
        try {
            await api.patch(`/wallet/admin/withdrawals/${withdrawal._id}`, {
                status,
                txnId: mode === 'approve' ? txnId : undefined,
                transferredAmount: mode === 'approve' ? Number(transferredAmount) : undefined,
                reason: reason || undefined,
            });
            toast.success(`Withdrawal ${mode === 'approve' ? 'approved' : 'rejected'} successfully`);
            closeModal();
            fetchWithdrawals();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const pendingCount = withdrawals.filter(w => w.status === 'pending').length;

    return (
        <div className="w-full">
            {/* Stats Row */}
            <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                    <p className="text-xs font-bold uppercase text-amber-500 tracking-widest mb-1">Pending</p>
                    <p className="text-3xl font-black text-amber-700">
                        {withdrawals.filter(w => w.status === 'pending').length}
                    </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                    <p className="text-xs font-bold uppercase text-emerald-500 tracking-widest mb-1">Approved</p>
                    <p className="text-3xl font-black text-emerald-700">
                        {withdrawals.filter(w => w.status === 'success').length}
                    </p>
                </div>
                <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
                    <p className="text-xs font-bold uppercase text-red-400 tracking-widest mb-1">Rejected</p>
                    <p className="text-3xl font-black text-red-600">
                        {withdrawals.filter(w => w.status === 'failed').length}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500">#</th>
                            <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500">Store / Reseller</th>
                            <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500">Requested</th>
                            <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500">Transferred</th>
                            <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500">Status</th>
                            <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500">TXN ID</th>
                            <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500">Reason</th>
                            <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500">Date</th>
                            <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="py-12 text-center text-slate-400 font-medium">
                                    Loading withdrawal requests...
                                </td>
                            </tr>
                        ) : withdrawals.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="py-12 text-center text-slate-400 font-medium">
                                    No withdrawal requests found.
                                </td>
                            </tr>
                        ) : (
                            withdrawals.map((req, idx) => (
                                <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4 font-bold text-slate-400">{idx + 1}</td>
                                    <td className="px-5 py-4">
                                        <p className="font-bold text-slate-900">{req.resellerId?.companyName || 'N/A'}</p>
                                        <p className="text-xs text-slate-400">{req.resellerId?.phoneNumber || req.resellerId?.email || ''}</p>
                                    </td>
                                    <td className="px-5 py-4 font-mono font-bold text-slate-800">
                                        ₹{req.requestedAmount?.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-5 py-4 font-mono text-slate-600">
                                        {req.transferredAmount ? `₹${req.transferredAmount?.toLocaleString('en-IN')}` : '—'}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLES[req.status] || ''}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                                        {req.txnId || '—'}
                                    </td>
                                    <td className="px-5 py-4 max-w-[180px] truncate text-xs text-slate-500">
                                        {req.reason || '—'}
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                                        {new Date(req.createdAt).toLocaleDateString('en-IN', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-5 py-4">
                                        {req.status === 'pending' ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openModal(req, 'approve')}
                                                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                                                >
                                                    <CheckCircle size={13} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => openModal(req, 'reject')}
                                                    className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200 transition-colors"
                                                >
                                                    <XCircle size={13} /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Action Modal */}
            {actionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                        <h2 className="mb-2 text-2xl font-black text-slate-900">
                            {actionModal.mode === 'approve' ? '✅ Approve Withdrawal' : '❌ Reject Withdrawal'}
                        </h2>
                        <p className="mb-6 text-sm text-slate-500">
                            Request by <strong>{actionModal.withdrawal.resellerId?.companyName || 'Reseller'}</strong> for{' '}
                            <strong className="text-slate-800 font-mono">
                                ₹{actionModal.withdrawal.requestedAmount?.toLocaleString('en-IN')}
                            </strong>
                        </p>

                        {actionModal.mode === 'reject' && (
                            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 font-medium">
                                ⚠️ Rejecting will automatically <strong>refund ₹{actionModal.withdrawal.requestedAmount?.toLocaleString('en-IN')}</strong> back to the reseller's wallet.
                            </div>
                        )}

                        <form onSubmit={handleAction} className="space-y-4">
                            {actionModal.mode === 'approve' && (
                                <>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-bold text-slate-700">Bank TXN ID *</label>
                                        <input
                                            required
                                            value={txnId}
                                            onChange={e => setTxnId(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 p-3 font-mono text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            placeholder="e.g. NEFT12345678"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-bold text-slate-700">Transferred Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={transferredAmount}
                                            onChange={e => setTransferredAmount(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 p-3 font-mono text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            placeholder="Leave blank if equal to requested"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                                    {actionModal.mode === 'approve' ? 'Note (optional)' : 'Rejection Reason *'}
                                </label>
                                <textarea
                                    required={actionModal.mode === 'reject'}
                                    rows={3}
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                                    placeholder={actionModal.mode === 'approve' ? 'Optional admin note...' : 'Reason for rejection...'}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50 ${
                                        actionModal.mode === 'approve'
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {isSubmitting ? 'Processing...' : actionModal.mode === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRemittances;
