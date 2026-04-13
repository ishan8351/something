import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu } from 'lucide-react';
import { ROUTES } from '../utils/routes';
import { getCategoryIcon } from '../utils/categoryIcons';
import api from '../utils/api';

function PublicNavbar() {
    const [catDropOpen, setCatDropOpen] = useState(false);
    const hoverTimeout = useRef(null);
    const navigate = useNavigate();

    const { data: dbCategories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data.data;
        },
    });

    const displayCategories = dbCategories.map((cat) => {
        const visual = getCategoryIcon(cat.name);
        return { ...cat, Icon: visual.Icon, color: visual.color, iconColor: visual.iconColor };
    });

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/90 shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="flex items-center gap-8">
                    <Link to={ROUTES.HOME} className="group flex items-center gap-2">
                        <img
                            src="https://m.media-amazon.com/images/X/bxt1/M/Bbxt1BI1cNpD5ln._SL160_QL95_FMwebp_.png"
                            alt="Sovely Logo"
                            className="h-8 w-auto transition-transform group-hover:scale-105"
                        />
                        <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Sovely <span className="text-sm font-medium text-emerald-600">B2B</span>
                        </span>
                    </Link>

                    {/* NEW: Public Category Dropdown */}
                    <div
                        className="relative hidden md:block"
                        onMouseEnter={() => {
                            clearTimeout(hoverTimeout.current);
                            setCatDropOpen(true);
                        }}
                        onMouseLeave={() => {
                            hoverTimeout.current = setTimeout(() => setCatDropOpen(false), 150);
                        }}
                    >
                        <button
                            className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${catDropOpen ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Categories
                            <ChevronDown
                                size={14}
                                strokeWidth={2.5}
                                className={`transition-transform duration-200 ${catDropOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {catDropOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="absolute top-full -left-4 mt-3 w-[500px] origin-top-left rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
                                >
                                    <div className="mb-3 px-2">
                                        <h4 className="text-[10px] font-black tracking-[0.1em] text-slate-400 uppercase">
                                            Quick Access
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        {displayCategories.map((cat, i) => (
                                            <button
                                                key={cat._id || i}
                                                onClick={() => {
                                                    setCatDropOpen(false);
                                                    navigate(
                                                        `/search?category=${encodeURIComponent(cat.name)}`
                                                    );
                                                }}
                                                className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all hover:bg-slate-50 hover:shadow-sm"
                                            >
                                                <span
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-transform group-hover:scale-110 group-hover:bg-white group-hover:shadow-md"
                                                    style={{ color: cat.iconColor }}
                                                >
                                                    <cat.Icon size={18} strokeWidth={2.5} />
                                                </span>
                                                <span className="truncate text-left text-xs font-bold text-slate-700 group-hover:text-emerald-600">
                                                    {cat.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Marketing Links */}
                <div className="hidden items-center gap-8 md:flex">
                    <a
                        href="#features"
                        className="text-sm font-bold text-slate-600 hover:text-slate-900"
                    >
                        Features
                    </a>
                    <a
                        href="#pricing"
                        className="text-sm font-bold text-slate-600 hover:text-slate-900"
                    >
                        Bulk Pricing
                    </a>
                </div>

                {}
                <div className="flex items-center gap-3">
                    <Link
                        to={ROUTES.LOGIN}
                        className="text-sm font-bold text-slate-600 transition-colors hover:text-slate-900"
                    >
                        Log in
                    </Link>
                    <Link
                        to={ROUTES.SIGNUP}
                        className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
                    >
                        Register Business
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default PublicNavbar;
