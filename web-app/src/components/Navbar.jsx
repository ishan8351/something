import { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getCategoryIcon } from '../utils/categoryIcons';
import api from '../utils/api';
import CartDrawer from './CartDrawer';
import { Search, X, Clock, TrendingUp, Wallet, FileText, Menu } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

function Navbar({ onToggleSidebar, onSelectCategory }) {
    const { user, logout, loading } = useContext(AuthContext);
    const cartCount = useCartStore((state) => state.getCartCount());

    const [catDropOpen, setCatDropOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const searchRef = useRef(null);
    const hoverTimeout = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data: dbCategories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data.data;
        },
    });

    const { data: liveSearchData, isFetching: isSearching } = useQuery({
        queryKey: ['liveSearch', debouncedSearch],
        queryFn: async () => {
            const res = await api.get(`/products?search=${debouncedSearch}&limit=3`);
            return res.data.data;
        },
        enabled: debouncedSearch.trim().length >= 2,
    });

    const displayCategories = dbCategories.map((cat) => {
        const visual = getCategoryIcon(cat.name);
        return {
            _id: cat._id,
            name: cat.name,
            Icon: visual.Icon,
            color: visual.color,
            iconColor: visual.iconColor,
        };
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMouseEnter = () => {
        clearTimeout(hoverTimeout.current);
        setCatDropOpen(true);
    };

    const handleMouseLeave = () => {
        hoverTimeout.current = setTimeout(() => setCatDropOpen(false), 180);
    };

    const executeSearch = (term) => {
        if (!term.trim()) return;
        setIsSearchOpen(false);
        setSearchInput(term);
        navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    };

    return (
        <nav className="relative sticky top-0 z-50 border-b border-slate-200/50 bg-white/95 shadow-sm backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onToggleSidebar}
                                className="p-1 text-slate-600 transition-colors hover:text-slate-900"
                                aria-label="Menu"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <Link to="/" className="group flex items-center gap-2">
                                <img
                                    src="https://m.media-amazon.com/images/X/bxt1/M/Bbxt1BI1cNpD5ln._SL160_QL95_FMwebp_.png"
                                    alt="Sovely Logo"
                                    className="h-8 w-auto transition-transform group-hover:scale-105"
                                />
                                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                                    Sovely{' '}
                                    <span className="text-sm font-medium text-slate-500">B2B</span>
                                </span>
                            </Link>
                        </div>

                        <ul className="hidden items-center gap-8 md:flex">
                            <li
                                className="relative"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button
                                    className={`flex items-center gap-1 font-semibold transition-colors ${catDropOpen ? 'text-accent' : 'text-slate-600 hover:text-slate-900'}`}
                                    onClick={() => setCatDropOpen((v) => !v)}
                                >
                                    Categories
                                    <svg
                                        className={`h-4 w-4 transition-transform duration-200 ${catDropOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        ></path>
                                    </svg>
                                </button>
                                <div
                                    className={`absolute top-full -left-4 mt-2 w-screen max-w-md origin-top-left rounded-2xl border border-slate-100 bg-white shadow-xl transition-all duration-200 ${catDropOpen ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'}`}
                                >
                                    <div className="grid grid-cols-3 gap-2 p-4">
                                        {displayCategories.map((cat, i) => (
                                            <button
                                                key={cat._id || i}
                                                onClick={() => {
                                                    setCatDropOpen(false);
                                                    if (onSelectCategory)
                                                        onSelectCategory(cat.name);
                                                    navigate(
                                                        `/search?category=${encodeURIComponent(cat.name)}`
                                                    );
                                                }}
                                                className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-slate-50"
                                            >
                                                <span
                                                    className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110"
                                                    style={{
                                                        backgroundColor: cat.color,
                                                        color: cat.iconColor,
                                                    }}
                                                >
                                                    <cat.Icon size={20} strokeWidth={2} />
                                                </span>
                                                <span className="w-full truncate text-center text-xs font-bold text-slate-700">
                                                    {cat.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </li>
                            <li>
                                <Link
                                    to="/bulk-order"
                                    className="font-semibold text-slate-600 transition-colors hover:text-slate-900"
                                >
                                    Quick Order
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <div ref={searchRef} className="relative hidden sm:block">
                            <div
                                className={`flex items-center rounded-full border bg-slate-100 px-4 py-2 transition-all ${isSearchOpen ? 'border-accent ring-accent/20 bg-white shadow-md ring-2' : 'border-transparent hover:bg-slate-200'}`}
                            >
                                <Search size={18} className="text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search SKUs, categories, suppliers..."
                                    className="w-48 border-none bg-transparent px-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 lg:w-64"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onFocus={() => setIsSearchOpen(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') executeSearch(searchInput);
                                    }}
                                />
                                {searchInput && (
                                    <button
                                        onClick={() => {
                                            setSearchInput('');
                                            searchRef.current?.querySelector('input')?.focus();
                                        }}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {isSearchOpen && (
                                <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 z-50 mt-3 flex w-[500px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
                                    {searchInput.trim().length > 0 ? (
                                        <div className="p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                                    Catalog Results for "{searchInput}"
                                                </p>
                                                {isSearching && (
                                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                {liveSearchData?.products?.length > 0
                                                    ? liveSearchData.products.map((prod) => (
                                                          <div
                                                              key={prod._id}
                                                              onClick={() => {
                                                                  setIsSearchOpen(false);
                                                                  navigate(`/product/${prod._id}`);
                                                              }}
                                                              className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-slate-100 hover:bg-slate-50"
                                                          >
                                                              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                                                  <img
                                                                      src={
                                                                          prod.images?.[0]?.url ||
                                                                          'https://via.placeholder.com/40'
                                                                      }
                                                                      alt={prod.title}
                                                                      className="h-full w-full object-cover"
                                                                  />
                                                              </div>
                                                              <div className="flex-1 overflow-hidden">
                                                                  <p className="truncate text-sm font-bold text-slate-900">
                                                                      {prod.title}
                                                                  </p>
                                                                  <p className="mb-1 font-mono text-xs text-slate-500">
                                                                      SKU: {prod.sku}
                                                                  </p>
                                                                  <p className="text-xs font-bold text-emerald-600">
                                                                      MOQ: {prod.moq || 10} units •
                                                                      ₹
                                                                      {prod.platformSellPrice?.toLocaleString(
                                                                          'en-IN'
                                                                      ) || 0}
                                                                      /unit
                                                                  </p>
                                                              </div>
                                                          </div>
                                                      ))
                                                    : !isSearching && (
                                                          <div className="py-4 text-center text-sm text-slate-500">
                                                              No inventory found. Try searching by
                                                              SKU.
                                                          </div>
                                                      )}
                                            </div>
                                            <button
                                                onClick={() => executeSearch(searchInput)}
                                                className="text-accent hover:text-accent/80 mt-4 w-full rounded-lg bg-slate-50 py-2 text-center text-sm font-bold transition-colors hover:bg-slate-100"
                                            >
                                                View all wholesale results →
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex bg-slate-50/50">
                                            <div className="w-1/2 border-r border-slate-100 p-4">
                                                <p className="mb-3 flex items-center gap-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                                    <Clock size={14} /> Quick Procure
                                                </p>
                                                <ul className="space-y-2">
                                                    {[
                                                        'Industrial Packaging',
                                                        'Corporate Gifting',
                                                        'Office Electronics',
                                                        'Raw Materials',
                                                    ].map((term) => (
                                                        <li
                                                            key={term}
                                                            onClick={() => executeSearch(term)}
                                                            className="hover:text-accent cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-white"
                                                        >
                                                            {term}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="w-1/2 p-4">
                                                <p className="mb-3 flex items-center gap-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                                    <TrendingUp size={14} /> High Margin Categories
                                                </p>
                                                <ul className="space-y-2">
                                                    {[
                                                        'Bulk T-Shirts (Blank)',
                                                        'Corrugated Boxes',
                                                        'Wholesale Fasteners',
                                                    ].map((term) => (
                                                        <li
                                                            key={term}
                                                            onClick={() => executeSearch(term)}
                                                            className="hover:text-accent cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-white"
                                                        >
                                                            {term}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Wallet Quick Link instead of Wishlist */}
                            {user && (
                                <button
                                    onClick={() => navigate('/wallet')}
                                    className="hover:text-primary hover:bg-primary/10 relative rounded-full p-2 text-slate-600 transition-colors"
                                    title="Wallet Balance"
                                >
                                    <Wallet className="h-6 w-6" />
                                </button>
                            )}

                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                title="Draft Order / Cart"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    ></path>
                                </svg>
                                {/* Search your Navbar.jsx for this block and update it */}
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[10px] font-bold text-white">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            <div className="ml-2 hidden border-l border-slate-200 pl-4 lg:block">
                                {loading ? (
                                    <div className="border-t-accent h-8 w-8 animate-spin rounded-full border-2 border-slate-200"></div>
                                ) : user ? (
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <Link
                                                to="/my-account"
                                                className="hover:text-accent text-sm font-bold text-slate-900"
                                            >
                                                {user?.companyName || user?.name?.split(' ')[0]}
                                            </Link>
                                            <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
                                                Verified Buyer
                                            </span>
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="text-xs font-bold text-slate-500 hover:text-slate-900"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Link
                                            to="/login"
                                            className="text-sm font-bold text-slate-600 hover:text-slate-900"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                                        >
                                            Register Business
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isSearchOpen && (
                <div
                    className="fixed inset-0 top-20 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSearchOpen(false)}
                ></div>
            )}

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </nav>
    );
}

export default Navbar;
