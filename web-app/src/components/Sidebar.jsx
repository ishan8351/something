import React, { useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { Home, UploadCloud, FileText, Package, Wallet, Settings, Building2, X } from 'lucide-react';

function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        await logout();
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        onClose();
        navigate('/login');
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    return (
        <div className="relative z-[100]">
            <div
                className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <aside
                className={`fixed inset-y-0 left-0 flex w-[85vw] max-w-sm transform flex-col border-r border-white/50 bg-white/90 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-between border-b border-slate-100 p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-1.5 shadow-sm">
                            <img
                                src="https://m.media-amazon.com/images/X/bxt1/M/Bbxt1BI1cNpD5ln._SL160_QL95_FMwebp_.png"
                                alt="Sovely Logo"
                                className="h-6 w-auto"
                            />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900">
                            Sovely B2B
                        </span>
                    </div>
                    <button
                        className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto px-4 py-6">
                    <div>
                        <h3 className="mb-3 px-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                            Procurement Portal
                        </h3>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    to="/"
                                    onClick={onClose}
                                    className="text-accent flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 font-bold"
                                >
                                    <Home size={20} /> Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/bulk-order"
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <UploadCloud size={20} /> Quick Order Upload
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/my-account/invoices"
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <FileText size={20} /> My Invoices & Tax
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/orders"
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <Package size={20} /> Orders & Tracking
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/wallet"
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <Wallet size={20} /> Wallet & Credit
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-3 px-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                            Business Settings
                        </h3>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    to="/my-account"
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <Building2 size={20} /> Company Profile
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/my-account/settings"
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <Settings size={20} /> Account Preferences
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                    {user ? (
                        <div className="flex w-full flex-col items-center">
                            <div className="mb-5 flex flex-col items-center text-center">
                                <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="User Avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-slate-400">
                                            {user.companyName
                                                ? user.companyName.charAt(0).toUpperCase()
                                                : 'B'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-slate-500">
                                    Purchasing as <br />
                                    <span className="text-base font-bold text-slate-900">
                                        {user.companyName || user.name}
                                    </span>
                                </p>
                                <p className="mt-1 flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700 uppercase">
                                    GST Verified
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-danger/10 text-danger hover:bg-danger w-full rounded-full py-3 font-bold shadow-sm transition-colors hover:text-white"
                            >
                                Secure Log Out
                            </button>
                        </div>
                    ) : (
                        <div className="w-full text-center">
                            <p className="mb-4 text-sm font-bold text-slate-600">
                                Ready to scale your sourcing?
                            </p>
                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/login"
                                    onClick={onClose}
                                    className="w-full rounded-full border-2 border-slate-200 py-3 font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-white"
                                >
                                    Business Login
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={onClose}
                                    className="hover:bg-primary hover:shadow-primary/30 w-full rounded-full bg-slate-900 py-3 font-bold text-white transition-all hover:shadow-lg"
                                >
                                    Apply for Wholesale
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}

export default Sidebar;
