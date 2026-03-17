import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api.js';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterOption, setFilterOption] = useState('ALL');

    const [updatingId, setUpdatingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, filterOption]);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await api.get('/users/admin/all', {
                    params: {
                        page,
                        limit: 10,
                        search: debouncedSearch,
                        role: filterOption,
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
    }, [page, debouncedSearch, filterOption]);

    const submitUserUpdate = async (id) => {
        setIsSaving(true);
        try {
            const res = await api.put(`/users/admin/${id}/role`, { role: editForm.role });
            setUsers((prev) => prev.map((u) => (u._id === id ? res.data.data : u)));
            setUpdatingId(null);
        } catch (err) {
            alert('Failed to update user');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
                <div className="focus-within:border-accent focus-within:ring-accent flex flex-1 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:ring-1">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Name or Email..."
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
                        <option value="ALL">All Roles</option>
                        <option value="CUSTOMER">Customer</option>
                        <option value="ADMIN">Admin</option>
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
                                    Name
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Email
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Role
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Joined Date
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Action
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
                                        No users found.
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
                                        <td className="p-4 font-bold whitespace-nowrap text-slate-900">
                                            {u.name}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-500">
                                            {u.email}
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
                                        <td className="p-4 text-sm font-medium text-slate-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
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
