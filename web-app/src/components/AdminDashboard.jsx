import React, { useState } from 'react';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    TrendingUp,
    Upload,
    FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import BulkUpload from './BulkUpload';
import AdminInvoices from './admin/AdminInvoices';

import AdminOverview from './admin/AdminOverview';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';
import AdminUsers from './admin/AdminUsers';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <AdminOverview setActiveTab={setActiveTab} />;
            case 'orders':
                return <AdminOrders />;
            case 'products':
                return <AdminProducts />;
            case 'bulk-upload':
                return <BulkUpload />;
            case 'users':
                return <AdminUsers />;
            case 'invoices':
                return <AdminInvoices />;
            default:
                return <AdminOrders />;
        }
    };

    return (
        <div className="selection:bg-accent/30 relative flex min-h-screen flex-col bg-slate-50/50 font-sans">
            <Navbar />

            <div className="relative flex flex-1 overflow-hidden">
                {}
                <motion.aside
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="fixed top-28 bottom-6 left-6 z-40 flex hidden w-64 flex-col gap-2 rounded-3xl border border-white bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl md:flex"
                >
                    <h3 className="mb-4 px-3 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                        Command Center
                    </h3>
                    {[
                        { id: 'overview', icon: TrendingUp, label: 'Telemetry' },
                        { id: 'orders', icon: ShoppingBag, label: 'Fulfillment' },
                        { id: 'products', icon: Package, label: 'Inventory' },
                        { id: 'invoices', icon: FileText, label: 'Ledger / Bills' },
                        { id: 'bulk-upload', icon: Upload, label: 'Mass Import' },
                        { id: 'users', icon: Users, label: 'User Matrix' },
                    ].map((tab) => (
                        <motion.button
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                                activeTab === tab.id
                                    ? 'shadow-accent/20 text-white shadow-lg'
                                    : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'
                            }`}
                        >
                            {}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabBackground"
                                    className="absolute inset-0 -z-10 rounded-2xl bg-slate-900"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <tab.icon
                                size={18}
                                className={
                                    activeTab === tab.id
                                        ? 'text-accent relative z-10'
                                        : 'text-slate-400'
                                }
                            />
                            <span className="relative z-10">{tab.label}</span>
                        </motion.button>
                    ))}
                </motion.aside>

                {}
                {}
                <main className="custom-scrollbar flex-1 overflow-y-auto p-6 md:ml-72 lg:p-10">
                    <motion.h2
                        layoutId="pageTitle"
                        className="mb-8 text-3xl font-black tracking-tight text-slate-900 capitalize drop-shadow-sm"
                    >
                        {activeTab.replace('-', ' ')}
                    </motion.h2>

                    {}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="w-full"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
