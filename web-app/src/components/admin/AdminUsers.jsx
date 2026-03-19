import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Building2,
    ShieldCheck,
    Clock,
    Edit2,
} from 'lucide-react';
import api from '../../utils/api.js';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [kycFilter, setKycFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');

    const [updatingId, setUpdatingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                // Assuming you have an admin user fetching route
                // If you didn't build one, it's just a standard GET to /users with admin middleware
                const res = await api.get('/users/admin/all', {
                    params: {
                        search: debouncedSearch,
                        role: roleFilter,
                        kycStatus: kycFilter,
                    },
                });

                // Handle different response structures gracefully
                const data = res.data?.data?.users || res.data?.data || res.data || [];
                setUsers(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch users:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [debouncedSearch, roleFilter, kycFilter]);

    const updateKycStatus = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this Reseller as ${newStatus}?`)) return;

        try {
            // This endpoint needs to be created in your backend if it doesn't exist
            // e.g. PUT /api/v1/users/admin/:id/kyc
            const res = await api.put(`/users/admin/${id}/kyc`, { kycStatus: newStatus });

            // Optimistic UI update
            setUsers((prev) =>
                prev.map((u) => (u._id === id ? { ...u, kycStatus: newStatus } : u))
            );
            alert(`Reseller KYC updated to ${newStatus}`);
        } catch (err) {
            alert('Failed to update KYC status. Ensure your backend route exists.');
        }
    };

    const getKycBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return (
                    <span className="flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-emerald-700 uppercase">
                        <CheckCircle size={12} /> Approved
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="flex w-fit items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-red-700 uppercase">
                        <XCircle size={12} /> Rejected
                    </span>
                );
            case 'PENDING':
            default:
                return (
                    <span className="flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-amber-700 uppercase">
                        <Clock size={12} /> Pending
                    </span>
                );
        }
    };

    return (
        <>
            {/* Filters Header */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Name, Email, GSTIN, Company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ml-3 w-full border-none text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                    <Filter size={16} className="mr-2 text-slate-400" />
                    <select
                        value={kycFilter}
                        onChange={(e) => setKycFilter(e.target.value)}
                        className="w-full cursor-pointer border-none bg-transparent py-2.5 text-sm font-bold text-slate-700 outline-none"
                    >
                        <option value="ALL">All KYC Statuses</option>
                        <option value="PENDING">Pending Approval (Action Req.)</option>
                        <option value="APPROVED">Approved Resellers</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>

                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                    <ShieldCheck size={16} className="mr-2 text-slate-400" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full cursor-pointer border-none bg-transparent py-2.5 text-sm font-bold text-slate-700 outline-none"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="RESELLER">Reseller</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="mb-6 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                <div className="relative min-h-[300px] overflow-x-auto">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 text-slate-400 backdrop-blur-sm">
                            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
                            <span className="text-sm font-bold">Loading Matrix...</span>
                        </div>
                    )}

                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Reseller Identity
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Business Details
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Wallet Balance
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    KYC Status
                                </th>
                                <th className="p-4 text-right text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {!loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <ShieldCheck size={48} className="mb-4 opacity-20" />
                                            <p className="font-bold text-slate-600">
                                                No resellers match your filters.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr
                                        key={u._id}
                                        className="group transition-colors hover:bg-slate-50/50"
                                    >
                                        {/* Identity */}
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 font-bold text-slate-900">
                                                {u.name}
                                                {u.role === 'ADMIN' && (
                                                    <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] tracking-wider text-white uppercase">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm font-medium text-slate-500">
                                                {u.email || u.phoneNumber}
                                            </div>
                                        </td>

                                        {/* Business */}
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                                <Building2 size={14} className="text-slate-400" />
                                                {u.companyName || 'Not Provided'}
                                            </div>
                                            <div className="mt-0.5 text-[11px] font-bold tracking-wider text-slate-500">
                                                GSTIN:{' '}
                                                <span className="font-mono text-slate-900">
                                                    {u.gstin || 'None'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Wallet */}
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="font-black text-emerald-600">
                                                ₹
                                                {u.walletBalance?.toLocaleString('en-IN') || '0.00'}
                                            </div>
                                        </td>

                                        {/* KYC Status */}
                                        <td className="p-4 whitespace-nowrap">
                                            {getKycBadge(u.kycStatus)}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-right whitespace-nowrap">
                                            {u.role !== 'ADMIN' && (
                                                <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                    {u.kycStatus !== 'APPROVED' && (
                                                        <button
                                                            onClick={() =>
                                                                updateKycStatus(u._id, 'APPROVED')
                                                            }
                                                            className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-200"
                                                        >
                                                            <CheckCircle size={14} /> Approve
                                                        </button>
                                                    )}
                                                    {u.kycStatus !== 'REJECTED' && (
                                                        <button
                                                            onClick={() =>
                                                                updateKycStatus(u._id, 'REJECTED')
                                                            }
                                                            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-200"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminUsers;
