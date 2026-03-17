import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Edit2,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Building2,
} from 'lucide-react';
import api from '../../utils/api.js';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [roleFilter, setRoleFilter] = useState('ALL');
    const [accountFilter, setAccountFilter] = useState('ALL');
    const [b2bStatusFilter, setB2bStatusFilter] = useState('ALL');

    const [updatingId, setUpdatingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, roleFilter, accountFilter, b2bStatusFilter]);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await api.get('/users/admin/all', {
                    params: {
                        page,
                        limit: 10,
                        search: debouncedSearch,
                        role: roleFilter,
                        accountType: accountFilter,
                        b2bStatus: b2bStatusFilter,
                    },
                });
                setUsers(res.data.data.data);
                setTotalPages(res.data.data.pagination.totalPages);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [page, debouncedSearch, roleFilter, accountFilter, b2bStatusFilter]);

    const submitUserUpdate = async (id) => {
        setIsSaving(true);
        try {
            const res = await api.put(`/users/admin/${id}/role`, { role: editForm.role });
            setUsers((prev) => prev.map((u) => (u._id === id ? res.data.data : u)));
            setUpdatingId(null);
        } catch (err) {
            alert('Failed to update user role');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleB2BVerification = async (id, currentStatus) => {
        if (
            !window.confirm(
                `Are you sure you want to ${currentStatus ? 'revoke' : 'approve'} B2B access for this user?`
            )
        )
            return;

        try {
            const res = await api.put(`/users/admin/${id}/b2b-verify`, {
                isVerifiedB2B: !currentStatus,
            });
            setUsers((prev) => prev.map((u) => (u._id === id ? res.data.data : u)));
        } catch (err) {
            alert('Failed to update B2B status');
        }
    };

    return (
        <>
            {}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5">
                <div className="focus-within:border-accent focus-within:ring-accent flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:ring-1 md:col-span-2 lg:col-span-2">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Name, Email, GSTIN, Company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ml-3 w-full border-none text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                </div>

                <div className="focus-within:border-accent focus-within:ring-accent flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:ring-1">
                    <select
                        value={accountFilter}
                        onChange={(e) => setAccountFilter(e.target.value)}
                        className="w-full cursor-pointer border-none bg-transparent py-2.5 text-sm font-bold text-slate-700 outline-none"
                    >
                        <option value="ALL">All Accounts</option>
                        <option value="B2B">B2B Only</option>
                        <option value="B2C">B2C Only</option>
                    </select>
                </div>

                <div className="focus-within:border-accent focus-within:ring-accent flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:ring-1">
                    <select
                        value={b2bStatusFilter}
                        onChange={(e) => setB2bStatusFilter(e.target.value)}
                        className="w-full cursor-pointer border-none bg-transparent py-2.5 text-sm font-bold text-slate-700 outline-none"
                        disabled={accountFilter === 'B2C'}
                    >
                        <option value="ALL">B2B: All Status</option>
                        <option value="PENDING">B2B: Pending</option>
                        <option value="VERIFIED">B2B: Verified</option>
                    </select>
                </div>

                <div className="focus-within:border-accent focus-within:ring-accent flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:ring-1">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full cursor-pointer border-none bg-transparent py-2.5 text-sm font-bold text-slate-700 outline-none"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="CUSTOMER">Customer</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
            </div>

            {}
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
                                    User
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    B2B Details
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    B2B Status
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Role
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {!loading && users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-8 text-center font-medium text-slate-500"
                                    >
                                        No users match your criteria.
                                    </td>
                                </tr>
                            ) : null}
                            {users.map((u) => {
                                const isEdit = updatingId === u._id;
                                return (
                                    <tr
                                        key={u._id}
                                        className="transition-colors hover:bg-slate-50/50"
                                    >
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="font-bold text-slate-900">{u.name}</div>
                                            <div className="text-sm font-medium text-slate-500">
                                                {u.email || u.phoneNumber}
                                            </div>
                                        </td>

                                        <td className="p-4 whitespace-nowrap">
                                            {u.accountType === 'B2B' ? (
                                                <>
                                                    <div className="flex items-center gap-1 font-bold text-slate-800">
                                                        <Building2
                                                            size={14}
                                                            className="text-slate-400"
                                                        />
                                                        {u.companyName || 'N/A'}
                                                    </div>
                                                    <div className="text-[11px] font-bold tracking-wider text-slate-500">
                                                        GSTIN:{' '}
                                                        <span className="text-slate-700">
                                                            {u.gstin || 'Pending'}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-xs font-medium text-slate-400">
                                                    B2C Customer
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4 whitespace-nowrap">
                                            {u.accountType === 'B2B' ? (
                                                <button
                                                    onClick={() =>
                                                        toggleB2BVerification(
                                                            u._id,
                                                            u.isVerifiedB2B
                                                        )
                                                    }
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase transition-colors ${
                                                        u.isVerifiedB2B
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    }`}
                                                >
                                                    {u.isVerifiedB2B ? (
                                                        <CheckCircle size={12} />
                                                    ) : (
                                                        <XCircle size={12} />
                                                    )}
                                                    {u.isVerifiedB2B ? 'Verified' : 'Pending'}
                                                </button>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            {isEdit ? (
                                                <select
                                                    value={editForm.role}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            role: e.target.value,
                                                        })
                                                    }
                                                    className="focus:border-accent rounded border border-slate-300 p-1.5 text-xs font-bold outline-none"
                                                >
                                                    <option value="CUSTOMER">Customer</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            ) : (
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase ${u.role === 'ADMIN' ? 'bg-danger/10 text-danger' : 'bg-blue-100 text-blue-700'}`}
                                                >
                                                    {u.role}
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            {isEdit ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        disabled={isSaving}
                                                        onClick={() => submitUserUpdate(u._id)}
                                                        className="hover:bg-accent rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition-colors disabled:opacity-50"
                                                    >
                                                        {isSaving ? '...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={() => setUpdatingId(null)}
                                                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setUpdatingId(u._id);
                                                        setEditForm({ role: u.role });
                                                    }}
                                                    title="Edit System Role"
                                                    className="text-accent bg-accent/10 rounded-lg p-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-sm font-bold text-slate-500">
                    Page <span className="text-slate-900">{page}</span> of{' '}
                    <span className="text-slate-900">{totalPages || 1}</span>
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                    className="flex items-center gap-1 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </>
    );
};

export default AdminUsers;
