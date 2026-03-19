import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Package,
    Truck,
    CheckCircle2,
    ArrowLeft,
    AlertCircle,
    Search,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    MapPin,
    AlertOctagon,
    Wallet,
    Clock,
    CreditCard,
    Box,
} from 'lucide-react';
import api from '../utils/api.js';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                setOrders(Array.isArray(res.data?.data?.orders) ? res.data.data.orders : []);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    // --- Analytics for Top Cards ---
    const pendingProfit = orders
        .filter((ord) => ['SHIPPED', 'DELIVERED'].includes(ord.status)) // Not yet PROFIT_CREDITED
        .reduce((sum, ord) => sum + (ord.resellerProfitMargin || 0), 0);

    const ndrOrders = orders.filter((ord) => ord.status === 'NDR');
    const ndrCount = ndrOrders.length;

    const toggleExpand = (orderId) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) newExpanded.delete(orderId);
        else newExpanded.add(orderId);
        setExpandedOrders(newExpanded);
    };

    const processedOrders = orders.filter((ord) => {
        if (filter !== 'ALL' && ord.status !== filter) return false;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const ordNo = (ord.orderId || '').toLowerCase();
            const custName = (ord.endCustomerDetails?.name || '').toLowerCase();
            const itemMatch = ord.items?.some((i) =>
                (i.title || i.sku || '').toLowerCase().includes(term)
            );

            if (!ordNo.includes(term) && !custName.includes(term) && !itemMatch) {
                return false;
            }
        }
        return true;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING':
            case 'PROCESSING':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-200',
                    icon: Clock,
                };
            case 'SHIPPED':
                return {
                    bg: 'bg-indigo-50',
                    text: 'text-indigo-700',
                    border: 'border-indigo-200',
                    icon: Truck,
                };
            case 'DELIVERED':
                return {
                    bg: 'bg-teal-50',
                    text: 'text-teal-700',
                    border: 'border-teal-200',
                    icon: Package,
                };
            case 'PROFIT_CREDITED':
                return {
                    bg: 'bg-emerald-500',
                    text: 'text-white',
                    border: 'border-emerald-600',
                    icon: CheckCircle2,
                };
            case 'NDR':
                return {
                    bg: 'bg-amber-100',
                    text: 'text-amber-800',
                    border: 'border-amber-300',
                    icon: AlertOctagon,
                };
            case 'RTO':
            case 'CANCELLED':
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    border: 'border-red-200',
                    icon: AlertCircle,
                };
            default:
                return {
                    bg: 'bg-slate-50',
                    text: 'text-slate-700',
                    border: 'border-slate-200',
                    icon: Box,
                };
        }
    };

    return (
        <div className="mx-auto mb-20 w-full max-w-7xl flex-1 px-4 py-8 font-sans text-slate-900 sm:px-6 md:mb-0 lg:px-8 lg:py-12">
            {/* Header & Stats */}
            <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <Link
                        to="/my-account"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Orders & Payouts
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Track wholesale shipments, dropship deliveries, and pending profit margins.
                    </p>
                </div>

                <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-4 lg:pb-0">
                    {/* Stat Card 1: Pending Profit */}
                    <div className="flex min-w-[220px] shrink-0 items-center gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <span className="mb-0.5 block text-[10px] font-extrabold tracking-widest text-emerald-700 uppercase">
                                Incoming Margins
                            </span>
                            <div className="text-2xl font-black text-emerald-900">
                                ₹{pendingProfit.toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>

                    {/* Stat Card 2: NDR Alerts */}
                    <div
                        className={`flex min-w-[220px] shrink-0 items-center gap-4 rounded-2xl border p-5 shadow-sm transition-all ${ndrCount > 0 ? 'animate-[pulse_3s_ease-in-out_infinite] border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50' : 'border-slate-200 bg-white'}`}
                    >
                        <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${ndrCount > 0 ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-slate-100 text-slate-400'}`}
                        >
                            <AlertOctagon size={24} />
                        </div>
                        <div>
                            <span
                                className={`mb-0.5 block text-[10px] font-extrabold tracking-widest uppercase ${ndrCount > 0 ? 'text-amber-700' : 'text-slate-400'}`}
                            >
                                NDR Alerts
                            </span>
                            <div
                                className={`text-2xl font-black ${ndrCount > 0 ? 'text-amber-900' : 'text-slate-900'}`}
                            >
                                {ndrCount}{' '}
                                <span className="text-sm font-bold opacity-70">Action Req.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Level Alert for NDRs */}
            {ndrCount > 0 && (
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                            <AlertOctagon size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-extrabold text-amber-900">
                                Action Required: Failed Deliveries
                            </h4>
                            <p className="mt-0.5 text-xs font-bold text-amber-700">
                                You have {ndrCount} dropship orders facing delivery issues. Please
                                contact your customers to avoid RTO charges.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setFilter('NDR')}
                        className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-extrabold tracking-widest whitespace-nowrap text-white uppercase shadow-sm transition-colors hover:bg-amber-700"
                    >
                        View NDR Orders
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="relative max-w-lg flex-1">
                    <Search
                        size={18}
                        className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="text"
                        placeholder="Search Order ID, Customer, or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm font-bold text-slate-900 transition-all outline-none focus:border-slate-400 focus:bg-white"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-700 outline-none focus:border-slate-400"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending / Processing</option>
                        <option value="SHIPPED">Shipped / In Transit</option>
                        <option value="NDR">NDR (Failed Delivery)</option>
                        <option value="DELIVERED">Delivered (Pending Margin)</option>
                        <option value="PROFIT_CREDITED">Completed & Paid</option>
                        <option value="RTO">Returned (RTO)</option>
                    </select>
                </div>
            </div>

            {/* Order List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
                    <p className="text-xs font-bold tracking-widest uppercase">
                        Syncing Logistics...
                    </p>
                </div>
            ) : processedOrders.length === 0 ? (
                <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                    <div className="mb-4 rounded-full bg-slate-50 p-6">
                        <Package size={48} className="text-slate-300" />
                    </div>
                    <h3 className="mb-2 text-xl font-extrabold text-slate-900">No Orders Found</h3>
                    <p className="font-medium text-slate-500">
                        Try adjusting your filters or head to the catalog to procure inventory.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {processedOrders.map((ord) => {
                        const isExpanded = expandedOrders.has(ord._id);
                        const isDropship = !!ord.endCustomerDetails;
                        const statusDef = getStatusStyle(ord.status);
                        const StatusIcon = statusDef.icon;

                        return (
                            <div
                                key={ord._id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                            >
                                {/* Order Header */}
                                <div className="flex flex-col justify-between gap-6 border-b border-slate-100 p-5 md:p-6 lg:flex-row">
                                    {/* Left: ID & Logistics */}
                                    <div className="flex-1">
                                        <div className="mb-2 flex flex-wrap items-center gap-3">
                                            <h3 className="text-lg font-black text-slate-900">
                                                {ord.orderId}
                                            </h3>
                                            <span
                                                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold tracking-widest uppercase ${statusDef.bg} ${statusDef.text} ${statusDef.border}`}
                                            >
                                                <StatusIcon size={12} />{' '}
                                                {ord.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                                            <p className="flex items-center gap-1">
                                                <Clock size={14} />{' '}
                                                {new Date(ord.createdAt).toLocaleDateString(
                                                    'en-IN',
                                                    {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }
                                                )}
                                            </p>
                                            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                            {isDropship ? (
                                                <span className="flex items-center gap-1 text-amber-600">
                                                    <MapPin size={14} /> Dropship Order
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-indigo-600">
                                                    <Box size={14} /> Wholesale Procurement
                                                </span>
                                            )}
                                        </div>

                                        {/* Status Progress Bar (Visual indicator) */}
                                        <div className="mt-4 flex max-w-sm items-center gap-1 opacity-80">
                                            <div
                                                className={`h-1.5 flex-1 rounded-l-full ${['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'PROFIT_CREDITED'].includes(ord.status) ? 'bg-indigo-500' : 'bg-slate-200'}`}
                                            ></div>
                                            <div
                                                className={`h-1.5 flex-1 ${['SHIPPED', 'DELIVERED', 'PROFIT_CREDITED'].includes(ord.status) ? 'bg-indigo-500' : 'bg-slate-200'}`}
                                            ></div>
                                            <div
                                                className={`h-1.5 flex-1 ${['DELIVERED', 'PROFIT_CREDITED'].includes(ord.status) ? 'bg-emerald-400' : 'bg-slate-200'}`}
                                            ></div>
                                            <div
                                                className={`h-1.5 flex-1 rounded-r-full ${ord.status === 'PROFIT_CREDITED' ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Right: Financial Snapshot */}
                                    <div
                                        className={`flex shrink-0 gap-6 rounded-xl border p-4 ${isDropship ? 'border-amber-100 bg-amber-50/50' : 'border-slate-100 bg-slate-50'}`}
                                    >
                                        <div>
                                            <p className="mb-1 flex items-center gap-1 text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
                                                <Wallet size={12} /> Platform Deducted
                                            </p>
                                            <p className="text-lg font-black text-slate-900">
                                                ₹{ord.totalPlatformCost.toLocaleString('en-IN')}
                                            </p>
                                        </div>

                                        {isDropship && (
                                            <>
                                                <div className="my-1 w-px bg-amber-200"></div>
                                                <div>
                                                    <p className="mb-1 flex items-center gap-1 text-[10px] font-extrabold tracking-widest text-emerald-700 uppercase">
                                                        <TrendingUp size={12} /> Your Net Margin
                                                    </p>
                                                    <p className="text-lg font-black text-emerald-600">
                                                        +₹
                                                        {(
                                                            ord.resellerProfitMargin || 0
                                                        ).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 p-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        {ord.status === 'NDR' && (
                                            <span className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-100 px-3 py-1.5 font-bold text-amber-800 shadow-sm">
                                                <AlertOctagon size={16} /> Reason:{' '}
                                                {ord.ndrDetails?.reason || 'Customer Unavailable'}
                                            </span>
                                        )}
                                        {ord.tracking?.trackingUrl && (
                                            <a
                                                href={ord.tracking.trackingUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2 font-bold text-indigo-600 transition-colors hover:bg-indigo-100"
                                            >
                                                <Truck size={16} /> Track Shipment
                                            </a>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => toggleExpand(ord._id)}
                                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold tracking-widest text-slate-600 uppercase shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        {isExpanded ? (
                                            <>
                                                <ChevronUp size={16} /> Hide Details
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown size={16} /> View Order Data
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="grid grid-cols-1 gap-8 border-t border-slate-200 bg-white p-6 lg:grid-cols-3">
                                        {/* Items List */}
                                        <div className="space-y-4 lg:col-span-2">
                                            <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                                                <Package size={16} /> Order Contents
                                            </h4>
                                            <div className="divide-y divide-slate-50 overflow-hidden rounded-2xl border border-slate-100">
                                                {ord.items.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-4 bg-white p-4 transition-colors hover:bg-slate-50"
                                                    >
                                                        <div className="h-14 w-14 flex-shrink-0 rounded-xl border border-slate-200 bg-slate-100">
                                                            {item.image && (
                                                                <img
                                                                    src={item.image}
                                                                    alt=""
                                                                    className="h-full w-full rounded-xl object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-bold text-slate-900">
                                                                {item.title}
                                                            </p>
                                                            <p className="mt-1 text-xs font-bold text-slate-500">
                                                                SKU:{' '}
                                                                <span className="rounded bg-slate-100 px-1 font-mono">
                                                                    {item.sku}
                                                                </span>{' '}
                                                                | Qty: {item.qty}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                                                                Base Rate
                                                            </p>
                                                            <p className="text-sm font-black text-slate-900">
                                                                ₹
                                                                {item.platformBasePrice?.toLocaleString(
                                                                    'en-IN'
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Logistics & Payment Panel */}
                                        <div className="space-y-6">
                                            {isDropship && ord.endCustomerDetails ? (
                                                <div>
                                                    <h4 className="mb-3 flex items-center gap-2 text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                                                        <MapPin size={16} /> Dropship Address
                                                    </h4>
                                                    <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 text-sm font-medium text-slate-700">
                                                        <p className="text-base font-black text-slate-900">
                                                            {ord.endCustomerDetails.name}
                                                        </p>
                                                        <p className="mt-1 font-bold text-slate-600">
                                                            {ord.endCustomerDetails.phone}
                                                        </p>
                                                        <div className="mt-3 border-t border-amber-200/50 pt-3">
                                                            <p>
                                                                {
                                                                    ord.endCustomerDetails.address
                                                                        .street
                                                                }
                                                            </p>
                                                            <p>
                                                                {
                                                                    ord.endCustomerDetails.address
                                                                        .city
                                                                }
                                                                ,{' '}
                                                                {
                                                                    ord.endCustomerDetails.address
                                                                        .state
                                                                }
                                                            </p>
                                                            <p className="font-bold">
                                                                {ord.endCustomerDetails.address.zip}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h4 className="mb-3 flex items-center gap-2 text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                                                        <Box size={16} /> Delivery Destination
                                                    </h4>
                                                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 text-sm font-medium text-slate-700">
                                                        <p className="font-black text-slate-900">
                                                            Standard B2B Delivery
                                                        </p>
                                                        <p className="mt-1 text-slate-600">
                                                            Items will be dispatched to your
                                                            registered HQ address based on KYC
                                                            details.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <h4 className="mb-3 flex items-center gap-2 text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                                                    <CreditCard size={16} /> Customer Payment
                                                </h4>
                                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-900">
                                                    {ord.paymentMethod === 'COD'
                                                        ? 'Cash on Delivery'
                                                        : 'Prepaid (Wallet)'}
                                                    {ord.paymentMethod === 'COD' && (
                                                        <span className="rounded-md bg-slate-900 px-2 py-1 text-[10px] tracking-widest text-white uppercase">
                                                            To Collect: ₹
                                                            {ord.amountToCollect?.toLocaleString(
                                                                'en-IN'
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
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
