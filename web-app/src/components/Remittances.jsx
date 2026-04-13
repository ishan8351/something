import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { AlertCircle, FileImage } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Remittances = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawableBalance, setWithdrawableBalance] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchWithdrawals();
        fetchWithdrawableBalance();
    }, []);

    const fetchWithdrawableBalance = async () => {
        try {
            const res = await api.get('/wallet/balance');
            setWithdrawableBalance(res.data?.data?.withdrawable || 0);
        } catch (error) {
            console.error('Failed to fetch withdrawable balance:', error);
        }
    };

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await api.get('/wallet/withdrawals?limit=100');
            setWithdrawals(res.data?.data?.withdrawals || []);
        } catch (error) {
            console.error('Failed to fetch withdrawals:', error);
            toast.error('Failed to load remittance data');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        const amt = Number(withdrawAmount);
        
        if (!amt || amt <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (amt > withdrawableBalance) {
            toast.error(`Max withdrawable is ₹${withdrawableBalance.toLocaleString('en-IN')}. 30% of recent credits are on hold for 15 days.`);
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/wallet/withdraw', { amount: amt });
            toast.success('Withdrawal request submitted!');
            setIsModalOpen(false);
            setWithdrawAmount('');
            refreshUser();
            fetchWithdrawableBalance();
            fetchWithdrawals();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">
                        Remittance
                    </h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded bg-red-600 px-6 py-2 text-sm font-bold text-white transition-opacity hover:bg-red-700 shadow-sm"
                >
                    Withdraw Request
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-[#f8f9fa] text-xs font-bold uppercase text-slate-900 border-b border-slate-200">
                        <tr>
                            <th className="px-5 py-4">#</th>
                            <th className="px-5 py-4">Store</th>
                            <th className="px-5 py-4">Amount</th>
                            <th className="px-5 py-4 whitespace-nowrap">Transferred Amount</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4">Reason</th>
                            <th className="px-5 py-4 whitespace-nowrap">TXN Id</th>
                            <th className="px-5 py-4">Created</th>
                            <th className="px-5 py-4">Screenshot</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="py-10 text-center text-slate-400 font-medium">
                                    Loading remittance records...
                                </td>
                            </tr>
                        ) : withdrawals.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="py-10 text-center text-slate-400 font-medium">
                                    No withdrawal requests found.
                                </td>
                            </tr>
                        ) : (
                            withdrawals.map((req, idx) => (
                                <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4 font-medium text-slate-900">
                                        {idx + 1}
                                    </td>
                                    <td className="px-5 py-4 font-bold text-slate-700">
                                        {req.resellerId?.companyName || user.companyName || 'Store'}
                                    </td>
                                    <td className="px-5 py-4 font-mono font-medium text-slate-800">
                                        {req.requestedAmount?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-5 py-4 font-mono font-medium text-slate-800">
                                        {req.transferredAmount || ''}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-slate-600">
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 max-w-[200px] truncate text-slate-500">
                                        {req.reason || ''}
                                    </td>
                                    <td className="px-5 py-4 font-mono text-slate-600">
                                        {req.txnId || ''}
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                                        {new Date(req.createdAt).toLocaleString('en-IN', {
                                            month: '2-digit',
                                            day: '2-digit',
                                            year: '2-digit',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            hour12: true
                                        }).replace(',', '')}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        {req.screenshotUrl && (
                                            <a href={req.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                                <FileImage size={18} className="inline"/>
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Withdraw Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl">
                        <h2 className="mb-6 text-2xl font-black text-slate-900">Request Withdrawal</h2>

                        <div className="mb-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Available to Withdraw</p>
                            <p className="text-xl font-black text-emerald-600">
                                ₹{withdrawableBalance?.toLocaleString('en-IN') || '0'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">30% of funds received within last 15 days are on hold</p>
                        </div>

                        <form onSubmit={handleWithdraw}>
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Amount to Withdraw (₹)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={withdrawableBalance || 0}
                                    step="1"
                                    required
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 p-4 text-lg font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                                    placeholder="Enter amount"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setWithdrawAmount('');
                                    }}
                                    className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !withdrawAmount}
                                    className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Processing...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Remittances;
