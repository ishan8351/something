import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    X,
    Package,
    Truck,
    User,
    MapPin,
    TrendingUp,
    AlertOctagon,
} from 'lucide-react';
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
                // Endpoint to fetch ALL orders across the platform
                const res = await api.get('/orders/admin/all', {
                    params: {
                        page,
                        limit: 10,
                        search: debouncedSearch,
                        status: filterOption === 'ALL' ? '' : filterOption,
                    },
                });
                setOrders(res.data?.data?.orders || res.data?.data?.data || []);
                setTotalPages(res.data?.data?.pagination?.pages || 1);
            } catch (err) {
                console.error('Failed to fetch admin orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [page, debouncedSearch, filterOption]);

    const submitOrderUpdate = async (id) => {
        setIsSaving(true);
        try {
            const payload = {
                status: editForm.status,
                courierName: editForm.courierName,
                awbNumber: editForm.awbNumber,
                ndrReason: editForm.ndrReason,
            };

            // This hits the powerful order.controller.js we wrote which handles profit payouts automatically
            const res = await api.put(`/orders/${id}/status`, payload);

            setOrders((prev) => prev.map((o) => (o._id === id ? res.data.data : o)));
            setSelectedOrder(null);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Update Failed: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING':
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-700';
            case 'SHIPPED':
                return 'bg-indigo-100 text-indigo-700';
            case 'DELIVERED':
            case 'PROFIT_CREDITED':
                return 'bg-emerald-100 text-emerald-700';
            case 'NDR':
                return 'bg-amber-100 text-amber-800 animate-pulse';
            case 'RTO':
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <>
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
                <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Reseller, or End Customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ml-3 w-full border-none text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                </div>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900">
                    <Filter size={18} className="mr-2 text-slate-400" />
                    <select
                        value={filterOption}
                        onChange={(e) => setFilterOption(e.target.value)}
                        className="cursor-pointer border-none bg-transparent py-2.5 text-sm font-bold text-slate-700 outline-none"
                    >
                        <option value="ALL">All Orders</option>
                        <option value="PENDING">Pending (New)</option>
                        <option value="PROCESSING">Processing (Packing)</option>
                        <option value="SHIPPED">Shipped (In Transit)</option>
                        <option value="NDR">NDR (Action Required)</option>
                        <option value="DELIVERED">Delivered</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="mb-6 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                <div className="relative min-h-[300px] overflow-x-auto">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 text-slate-400 backdrop-blur-sm">
                            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
                        </div>
                    )}
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Order Details
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Reseller (Agent)
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Type & Routing
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Financials
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
                                        colSpan="6"
                                        className="p-12 text-center font-medium text-slate-500"
                                    >
                                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            ) : null}
                            {orders.map((order) => {
                                const isDropship = !!order.endCustomerDetails;
                                return (
                                    <tr
                                        key={order._id}
                                        className="transition-colors hover:bg-slate-50/80"
                                    >
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="font-mono font-bold text-slate-900">
                                                {order.orderId}
                                            </div>
                                            <div className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase">
                                                {new Date(order.createdAt).toLocaleDateString(
                                                    'en-IN',
                                                    { month: 'short', day: 'numeric' }
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="line-clamp-1 font-bold text-slate-900">
                                                {order.resellerId?.name || 'Unknown'}
                                            </div>
                                            <div className="text-xs font-medium text-slate-500">
                                                {order.resellerId?.companyName || 'N/A'}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            {isDropship ? (
                                                <div>
                                                    <span className="rounded border border-amber-200 bg-amber-100 px-2 py-0.5 text-[9px] font-black tracking-widest text-amber-800 uppercase">
                                                        Dropship
                                                    </span>
                                                    <div className="mt-1 max-w-[150px] truncate text-xs font-bold text-slate-700">
                                                        To: {order.endCustomerDetails.name}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="rounded border border-indigo-200 bg-indigo-100 px-2 py-0.5 text-[9px] font-black tracking-widest text-indigo-800 uppercase">
                                                    Wholesale
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <div className="text-xs font-bold text-slate-500">
                                                Platform:{' '}
                                                <span className="font-black text-slate-900">
                                                    ₹{order.totalPlatformCost}
                                                </span>
                                            </div>
                                            {isDropship && order.paymentMethod === 'COD' && (
                                                <div className="mt-0.5 text-xs font-bold text-slate-500">
                                                    COD:{' '}
                                                    <span className="font-black text-amber-600">
                                                        ₹{order.amountToCollect}
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-widest uppercase ${getStatusStyle(order.status)}`}
                                            >
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setEditForm({
                                                        status: order.status,
                                                        courierName:
                                                            order.tracking?.courierName || '',
                                                        awbNumber: order.tracking?.awbNumber || '',
                                                        ndrReason: order.ndrDetails?.reason || '',
                                                    });
                                                }}
                                                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-200"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
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

            {/* Slide-out Management Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0.5 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-slate-100 bg-white shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6">
                                <div>
                                    <h3 className="flex items-center gap-2 text-xl font-black text-slate-900">
                                        <Truck size={20} /> Dispatch Center
                                    </h3>
                                    <p className="mt-1 font-mono text-sm font-bold tracking-wider text-slate-500">
                                        {selectedOrder.orderId}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-400 shadow-sm hover:text-slate-900"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="custom-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                                {/* Routing & Financials */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            Platform Cost
                                        </p>
                                        <p className="text-lg font-black text-slate-900">
                                            ₹{selectedOrder.totalPlatformCost}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400">
                                            Pre-deducted from Wallet
                                        </p>
                                    </div>

                                    {!!selectedOrder.endCustomerDetails ? (
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                            <p className="mb-1 text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                                                COD to Collect
                                            </p>
                                            <p className="text-lg font-black text-amber-900">
                                                ₹{selectedOrder.amountToCollect}
                                            </p>
                                            <p className="text-[10px] font-bold text-amber-700">
                                                Must collect on delivery
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                                            <p className="mb-1 text-[10px] font-bold tracking-wider text-indigo-600 uppercase">
                                                Order Type
                                            </p>
                                            <p className="text-lg font-black text-indigo-900">
                                                Wholesale
                                            </p>
                                            <p className="text-[10px] font-bold text-indigo-700">
                                                Ship to Reseller Address
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Destination */}
                                <div>
                                    <h4 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        <MapPin size={14} /> Destination Address
                                    </h4>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700">
                                        {!!selectedOrder.endCustomerDetails ? (
                                            <>
                                                <p className="font-bold text-slate-900">
                                                    {selectedOrder.endCustomerDetails.name}
                                                </p>
                                                <p>{selectedOrder.endCustomerDetails.phone}</p>
                                                <p className="mt-2">
                                                    {
                                                        selectedOrder.endCustomerDetails.address
                                                            .street
                                                    }
                                                </p>
                                                <p>
                                                    {selectedOrder.endCustomerDetails.address.city},{' '}
                                                    {selectedOrder.endCustomerDetails.address.state}{' '}
                                                    {selectedOrder.endCustomerDetails.address.zip}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="font-bold text-amber-600">
                                                Fetch Address from Reseller Profile (
                                                {selectedOrder.resellerId?.companyName})
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Action Form */}
                                <div className="border-t border-dashed border-slate-200 pt-6">
                                    <h4 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        <Package size={14} /> Status & Tracking
                                    </h4>

                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <label className="mb-1 block text-xs font-bold tracking-wider text-slate-600">
                                                Update Status
                                            </label>
                                            <select
                                                value={editForm.status}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        status: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-white p-3 font-bold text-slate-900 outline-none focus:border-slate-900"
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="PROCESSING">
                                                    Processing (Packing)
                                                </option>
                                                <option value="SHIPPED">
                                                    Shipped (In Transit)
                                                </option>
                                                <option value="NDR">
                                                    NDR (Failed Delivery Attempt)
                                                </option>
                                                <option value="DELIVERED">
                                                    Delivered (Releases Profit)
                                                </option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                            {editForm.status === 'DELIVERED' && (
                                                <p className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600">
                                                    <TrendingUp size={12} /> Warning: This will
                                                    permanently credit ₹
                                                    {selectedOrder.resellerProfitMargin} to the
                                                    reseller's wallet.
                                                </p>
                                            )}
                                        </div>

                                        <AnimatePresence>
                                            {(editForm.status === 'SHIPPED' ||
                                                editForm.status === 'DELIVERED' ||
                                                editForm.status === 'NDR') && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="flex flex-col gap-4 overflow-hidden"
                                                >
                                                    <div>
                                                        <label className="mb-1 block text-xs font-bold tracking-wider text-slate-600">
                                                            Courier Partner
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Delhivery, Bluedart"
                                                            value={editForm.courierName}
                                                            onChange={(e) =>
                                                                setEditForm({
                                                                    ...editForm,
                                                                    courierName: e.target.value,
                                                                })
                                                            }
                                                            className="w-full rounded-xl border border-slate-200 bg-white p-3 font-medium text-slate-900 outline-none focus:border-slate-900"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-xs font-bold tracking-wider text-slate-600">
                                                            AWB / Tracking Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. AWB123456789"
                                                            value={editForm.awbNumber}
                                                            onChange={(e) =>
                                                                setEditForm({
                                                                    ...editForm,
                                                                    awbNumber: e.target.value,
                                                                })
                                                            }
                                                            className="w-full rounded-xl border border-slate-200 bg-white p-3 font-medium text-slate-900 outline-none focus:border-slate-900"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <AnimatePresence>
                                            {editForm.status === 'NDR' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <label className="mb-1 block flex items-center gap-1 text-xs font-bold tracking-wider text-amber-700">
                                                        <AlertOctagon size={12} /> NDR Reason
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Customer rejected, Address not found"
                                                        value={editForm.ndrReason || ''}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                ndrReason: e.target.value,
                                                            })
                                                        }
                                                        className="w-full rounded-xl border border-amber-200 bg-amber-50 p-3 font-bold text-amber-900 outline-none focus:border-amber-400"
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 p-6">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isSaving}
                                    onClick={() => submitOrderUpdate(selectedOrder._id)}
                                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800 disabled:opacity-50"
                                >
                                    {isSaving ? 'Processing...' : 'Save & Notify'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminOrders;
