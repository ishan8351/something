import React, { useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

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
            {}
            <div
                className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {}
            <aside
                className={`fixed inset-y-0 left-0 flex w-[85vw] max-w-sm transform flex-col border-r border-white/50 bg-white/90 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {}
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
                            Sovely
                        </span>
                    </div>
                    <button
                        className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        ✕
                    </button>
                </div>

                {}
                <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto px-4 py-6">
                    <div>
                        <h3 className="mb-3 px-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                            Main Menu
                        </h3>
                        <ul className="space-y-1">
                            <li>
                                <a
                                    href="#"
                                    className="text-accent flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 font-bold"
                                >
                                    <span className="text-lg">🏠</span> Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <span className="text-lg">📦</span> Manage NDR
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <span className="text-lg">🛍️</span> Cart
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <span className="text-lg">🚚</span> Order Track
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <span className="text-lg">📋</span> Inventory
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-3 px-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                            Discover
                        </h3>
                        <ul className="space-y-1">
                            <li>
                                <a
                                    href="#deals"
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <span className="text-lg">🔥</span> Today's Deals
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#categories"
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <span className="text-lg">🏷️</span> All Categories
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#services"
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <span className="text-lg">💳</span> Our Services
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-3 px-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                            Settings
                        </h3>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    to="/my-account"
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <span className="text-lg">👤</span> My Account
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <span className="text-lg">⚙️</span> Preferences
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {}
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
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-slate-500">
                                    Logged in as{' '}
                                    <span className="font-bold text-slate-900">
                                        {user.name || 'User'}
                                    </span>
                                </p>
                                <p className="mt-0.5 w-48 truncate text-xs text-slate-400">
                                    {user.email}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-danger/10 text-danger hover:bg-danger w-full rounded-full py-3 font-bold shadow-sm transition-colors hover:text-white"
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <div className="w-full text-center">
                            <p className="mb-4 text-sm font-bold text-slate-600">
                                Ready to start selling?
                            </p>
                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/login"
                                    onClick={onClose}
                                    className="w-full rounded-full border-2 border-slate-200 py-3 font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-white"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={onClose}
                                    className="hover:bg-accent hover:shadow-accent/30 w-full rounded-full bg-slate-900 py-3 font-bold text-white transition-all hover:shadow-lg"
                                >
                                    Sign Up Free
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
