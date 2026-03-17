import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api.js';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterOption, setFilterOption] = useState('ALL');

    const [selectedOrder, setSelectedOrder] = useState(null);
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
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await api.get('/orders/admin/all', {
                    params: {
                        page,
                        limit: 10,
                        search: debouncedSearch,
                        status: filterOption,
                    },
                });
                setOrders(res.data.data.data);
                setTotalPages(res.data.data.pagination.totalPages);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [page, debouncedSearch, filterOption]);

    const submitOrderUpdate = async (id) => {
        setIsSaving(true);
        try {
            const res = await api.put(`/orders/${id}/status`, {
                status: editForm.status,
                courierName: editForm.courierName,
                trackingNumber: editForm.trackingNumber,
            });
            setOrders((prev) => prev.map((o) => (o._id === id ? res.data.data : o)));
            setSelectedOrder(null);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Update Failed: ${errorMsg}`);
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
                        placeholder="Search by Order ID or Customer Name..."
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
                        <option value="ALL">All Filters</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
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
                                    Order ID
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Customer
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Amount
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Status
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {!loading && orders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-8 text-center font-medium text-slate-500"
                                    >
                                        No orders found matching your search.
                                    </td>
                                </tr>
                            ) : null}
                            {orders.map((order, index) => (
                                <motion.tr
                                    key={order._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group transition-colors hover:bg-slate-50/80"
                                >
                                    <td className="p-4 font-bold whitespace-nowrap text-slate-900">
                                        {order.orderId}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">
                                            {order.customerId?.name ||
                                                order.userId?.name ||
                                                'Unknown'}
                                        </div>
                                        <div className="text-xs font-medium text-slate-500">
                                            {order.customerId?.email || order.userId?.email}
                                        </div>
                                    </td>
                                    <td className="p-4 font-extrabold text-slate-900">
                                        ₹
                                        {(
                                            order.totalAmount ||
                                            order.grandTotal ||
                                            0
                                        ).toLocaleString('en-IN')}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-widest uppercase ${
                                                order.status === 'DELIVERED'
                                                    ? 'bg-green-100 text-green-700'
                                                    : order.status === 'CANCELLED'
                                                      ? 'bg-red-100 text-red-700'
                                                      : order.status === 'SHIPPED'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : order.status === 'PROCESSING'
                                                          ? 'bg-indigo-100 text-indigo-700'
                                                          : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setEditForm({
                                                    status: order.status,
                                                    courierName: order.tracking?.courierName,
                                                    trackingNumber: order.tracking?.trackingNumber,
                                                });
                                            }}
                                            className="text-accent bg-accent/10 hover:bg-accent rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition-colors hover:text-white"
                                        >
                                            Manage
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))}
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
            {}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        {}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
                        />

                        {}
                        <motion.div
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0.5 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-slate-100 bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 p-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">
                                        Manage Order
                                    </h3>
                                    <p className="mt-1 text-xs font-bold text-slate-400">
                                        {selectedOrder.orderId}
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ rotate: 90 }}
                                    onClick={() => setSelectedOrder(null)}
                                    className="rounded-full bg-slate-50 p-2 text-slate-400 hover:text-slate-900"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                        Order Status
                                    </label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, status: e.target.value })
                                        }
                                        className="focus:border-accent rounded-xl border border-slate-200 bg-slate-50 p-3 font-bold text-slate-700 outline-none"
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PROCESSING">Processing</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>

                                <AnimatePresence>
                                    {(editForm.status === 'SHIPPED' ||
                                        editForm.status === 'DELIVERED') && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="flex flex-col gap-4 overflow-hidden"
                                        >
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                                    Courier Partner
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. BlueDart"
                                                    value={editForm.courierName || ''}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            courierName: e.target.value,
                                                        })
                                                    }
                                                    className="focus:border-accent rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                                    Tracking / AWB Number
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 123456789"
                                                    value={editForm.trackingNumber || ''}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            trackingNumber: e.target.value,
                                                        })
                                                    }
                                                    className="focus:border-accent rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 outline-none"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 p-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedOrder(null)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSaving}
                                    onClick={() => submitOrderUpdate(selectedOrder._id)}
                                    className="hover:bg-accent flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-md transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminOrders;
