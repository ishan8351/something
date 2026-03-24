import { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getCategoryIcon } from '../utils/categoryIcons';
import { ROUTES } from '../utils/routes';
import api from '../utils/api';
import CartDrawer from './CartDrawer';
import { Search, X, Clock, Wallet, Menu, Shield, ShoppingCart, Plus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

// Utility component to highlight substrings in search results
const HighlightText = ({ text = '', highlight = '' }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <span key={i} className="bg-emerald-100 font-extrabold text-emerald-900">
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

function Navbar({ onToggleSidebar, onSelectCategory }) {
    const { user, logout, loading, isAdmin } = useContext(AuthContext);

    const cartCount = useCartStore((state) => {
        if (!state.cart?.items) return 0;
        return state.cart.items.reduce((total, item) => total + item.qty, 0);
    });
    const addToCart = useCartStore((state) => state.addToCart); // Added to allow Quick Add from search

    const [catDropOpen, setCatDropOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [addedSku, setAddedSku] = useState(null); // Feedback for quick add

    const searchRef = useRef(null);
    const inputRef = useRef(null);
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

    // The live search API call
    const { data: liveSearchData, isFetching: isSearching } = useQuery({
        queryKey: ['liveSearch', debouncedSearch],
        queryFn: async () => {
            const res = await api.get(`/products?search=${debouncedSearch}&limit=4`);
            return res.data.data;
        },
        enabled: debouncedSearch.trim().length >= 2,
    });

    const displayCategories = dbCategories.map((cat) => {
        const visual = getCategoryIcon(cat.name);
        return { ...cat, Icon: visual.Icon, color: visual.color, iconColor: visual.iconColor };
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

    const executeSearch = (term) => {
        if (!term.trim()) return;
        setIsSearchOpen(false);
        setSearchInput(term);
        navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setDebouncedSearch('');
        inputRef.current?.focus();
    };

    const handleQuickAdd = async (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        setAddedSku(product._id);
        await addToCart(product._id, product.moq || 10, 'WHOLESALE', 0);
        setTimeout(() => setAddedSku(null), 1500);
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
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <Link to={ROUTES.HOME} className="group flex items-center gap-2">
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

                        {/* Categories Dropdown (Kept exactly as you had it) */}
                        <ul className="hidden items-center gap-8 md:flex">
                            <li
                                className="relative"
                                onMouseEnter={() => {
                                    clearTimeout(hoverTimeout.current);
                                    setCatDropOpen(true);
                                }}
                                onMouseLeave={() => {
                                    hoverTimeout.current = setTimeout(
                                        () => setCatDropOpen(false),
                                        180
                                    );
                                }}
                            >
                                <button
                                    className={`flex items-center gap-1 font-semibold transition-colors ${catDropOpen ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'}`}
                                    onClick={() => setCatDropOpen((v) => !v)}
                                >
                                    Categories{' '}
                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform duration-200 ${catDropOpen ? 'rotate-180' : ''}`}
                                    />
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
                                    to={ROUTES.QUICK_ORDER}
                                    className="font-semibold text-slate-600 transition-colors hover:text-slate-900"
                                >
                                    Quick Order
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* THE UPGRADED SEARCH BAR */}
                        <div ref={searchRef} className="relative hidden sm:block">
                            <div
                                className={`flex items-center rounded-lg border px-4 py-2 transition-all ${isSearchOpen ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/20' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                            >
                                <Search size={18} className="text-slate-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search SKUs, titles..."
                                    className="w-48 border-none bg-transparent px-3 text-sm font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400 lg:w-72"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onFocus={() => setIsSearchOpen(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') executeSearch(searchInput);
                                    }}
                                />
                                {searchInput && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700"
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                )}
                            </div>

                            {/* LIVE SEARCH DROPDOWN OVERLAY */}
                            {isSearchOpen && searchInput.trim().length >= 2 && (
                                <div className="absolute top-full left-0 mt-2 w-full min-w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                    {isSearching ? (
                                        <div className="flex items-center justify-center p-6 text-sm font-bold text-slate-400">
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600"></div>{' '}
                                            Searching catalog...
                                        </div>
                                    ) : liveSearchData?.products?.length > 0 ? (
                                        <div className="flex flex-col">
                                            {liveSearchData.products.map((product) => (
                                                <div
                                                    key={product._id}
                                                    className="group flex items-center justify-between border-b border-slate-50 p-2 transition-colors hover:bg-slate-50"
                                                >
                                                    <div
                                                        className="flex items-center gap-3 overflow-hidden"
                                                        onClick={() => {
                                                            setIsSearchOpen(false);
                                                            navigate(`/product/${product._id}`);
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                product.images?.[0]?.url ||
                                                                'https://via.placeholder.com/40'
                                                            }
                                                            alt=""
                                                            className="h-10 w-10 rounded-md border border-slate-100 object-cover"
                                                        />
                                                        <div className="flex cursor-pointer flex-col overflow-hidden">
                                                            <span className="truncate text-xs font-extrabold text-slate-900 group-hover:text-emerald-700">
                                                                <HighlightText
                                                                    text={product.title}
                                                                    highlight={debouncedSearch}
                                                                />
                                                            </span>
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                                                <span>
                                                                    SKU:{' '}
                                                                    <HighlightText
                                                                        text={product.sku || 'N/A'}
                                                                        highlight={debouncedSearch}
                                                                    />
                                                                </span>
                                                                <span className="text-slate-300">
                                                                    |
                                                                </span>
                                                                <span className="text-emerald-600">
                                                                    ₹
                                                                    {(
                                                                        product.platformSellPrice ||
                                                                        product.dropshipBasePrice
                                                                    ).toLocaleString('en-IN')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleQuickAdd(e, product)}
                                                        disabled={addedSku === product._id}
                                                        className={`ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all ${addedSku === product._id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white'}`}
                                                        title="Quick Add (MOQ)"
                                                    >
                                                        {addedSku === product._id ? (
                                                            <Check size={14} />
                                                        ) : (
                                                            <Plus size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => executeSearch(debouncedSearch)}
                                                className="w-full bg-slate-50 p-3 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-emerald-700"
                                            >
                                                See all {liveSearchData.pagination?.total || 0}{' '}
                                                results &rarr;
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-sm font-bold text-slate-500">
                                            No SKUs or products found for "{debouncedSearch}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Rest of the auth/cart icons */}
                        <div className="flex items-center gap-3">
                            {isAdmin && (
                                <Link
                                    to={ROUTES.ADMIN}
                                    className="hidden items-center gap-1.5 rounded-full border border-blue-100 px-3 py-1.5 text-blue-600 transition-colors hover:bg-blue-50 sm:flex"
                                    title="Admin Console"
                                >
                                    <Shield className="h-4 w-4" />{' '}
                                    <span className="text-[10px] font-bold tracking-widest uppercase">
                                        Admin
                                    </span>
                                </Link>
                            )}

                            {user && (
                                <button
                                    onClick={() => navigate(ROUTES.WALLET)}
                                    className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
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
                                <ShoppingCart className="h-6 w-6" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[10px] font-bold text-white shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            <div className="ml-2 hidden border-l border-slate-200 pl-4 lg:block">
                                {loading ? (
                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600"></div>
                                ) : user ? (
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <Link
                                                to={ROUTES.MY_ACCOUNT}
                                                className="text-sm font-bold text-slate-900 hover:text-emerald-600"
                                            >
                                                {user?.companyName || user?.name?.split(' ')[0]}
                                            </Link>
                                            <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
                                                {isAdmin ? 'Platform Admin' : 'Verified Buyer'}
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
                                            to={ROUTES.LOGIN}
                                            className="text-sm font-bold text-slate-600 hover:text-slate-900"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            to={ROUTES.SIGNUP}
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
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </nav>
    );
}

// Added ChevronDown component inline since it wasn't imported from lucide-react in your original file
const ChevronDown = ({ size = 24, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default Navbar;
