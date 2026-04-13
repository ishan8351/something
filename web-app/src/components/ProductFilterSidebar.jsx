import React from 'react';
import { X, Box, Check, Truck, ShieldCheck, Zap } from 'lucide-react';

export default function ProductFilterSidebar({
    isMobileFilterOpen,
    setIsMobileFilterOpen,
    category,
    setCategory,
    dbCategories,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    maxDispatchDays,
    setMaxDispatchDays,
    verifiedOnly,
    setVerifiedOnly,
    b2bFilters,
    setB2bFilters,
    resetAll,
}) {
    const normalizePriceInput = (rawValue) => {
        const digitsOnly = String(rawValue ?? '').replace(/\D/g, '');
        if (digitsOnly === '') return '';
        return String(Number(digitsOnly));
    };

    const blockInvalidNumericKeys = (e) => {
        if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
            e.preventDefault();
        }
    };

    const enforceRangeOnBlur = (field) => {
        if (minPrice === '' || maxPrice === '') return;

        const min = Number(minPrice);
        const max = Number(maxPrice);
        if (!Number.isFinite(min) || !Number.isFinite(max) || min <= max) return;

        if (field === 'min') {
            setMinPrice(String(max));
            return;
        }

        setMaxPrice(String(min));
    };

    return (
        <aside
            className={`no-scrollbar overscroll-none fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 lg:sticky lg:inset-auto lg:top-24 lg:z-0 lg:h-auto lg:max-h-[calc(100vh-theme(spacing.24)-2rem)] lg:w-64 lg:translate-x-0 lg:rounded-xl lg:border lg:border-slate-200 lg:p-5 lg:shadow-sm ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900">Filters</h3>
                <div className="flex items-center gap-2">
                    <button
                        className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                        onClick={resetAll}
                    >
                        Clear All
                    </button>
                    <button
                        className="p-1 text-slate-400 lg:hidden"
                        onClick={() => setIsMobileFilterOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {}
                <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <Box size={14} /> Category
                    </h4>
                    <div className="max-h-48 space-y-0.5 overflow-y-auto overflow-x-hidden overscroll-none pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
                        {[{ _id: 'All', name: 'All Categories' }, ...dbCategories].map((cat) => (
                            <label
                                key={cat._id || cat.name}
                                className="group flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
                            >
                                <span
                                    className={`text-sm transition-colors ${category === cat.name ? 'font-bold text-emerald-600' : 'font-medium text-slate-600 group-hover:text-slate-900'}`}
                                >
                                    {cat.name}
                                </span>
                                <input
                                    type="radio"
                                    className="sr-only"
                                    checked={category === cat.name}
                                    onChange={() => setCategory(cat.name)}
                                />
                                {category === cat.name && (
                                    <Check size={14} className="text-emerald-600" />
                                )}
                            </label>
                        ))}
                    </div>
                </div>

                {}
                <div className="space-y-3 border-t border-slate-100 pt-5">
                    <h4 className="text-xs font-semibold text-slate-700">Unit Price (₹)</h4>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(normalizePriceInput(e.target.value))}
                            onKeyDown={blockInvalidNumericKeys}
                            onBlur={() => enforceRangeOnBlur('min')}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                        />
                        <span className="text-slate-300">-</span>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(normalizePriceInput(e.target.value))}
                            onKeyDown={blockInvalidNumericKeys}
                            onBlur={() => enforceRangeOnBlur('max')}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                        />
                    </div>
                </div>



                {/* Verified Supplier */}
                <div className="border-t border-slate-100 pt-5">
                    <label className="group flex cursor-pointer items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors group-hover:text-slate-900">
                            <ShieldCheck size={16} className="text-blue-600" /> Verified Vendors
                        </span>
                        <div
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${verifiedOnly ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={verifiedOnly}
                                onChange={() => setVerifiedOnly(!verifiedOnly)}
                            />
                            <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${verifiedOnly ? 'translate-x-4.5' : 'translate-x-1'}`}
                            />
                        </div>
                    </label>
                </div>

                {/* Ready to Ship Sidebar */}
                <div className="border-t border-slate-100 pt-5">
                    <label className="group flex cursor-pointer items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors group-hover:text-slate-900">
                            <Zap size={16} className="text-amber-500" /> Ready to Ship
                        </span>
                        <div
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${b2bFilters.readyToShip ? 'bg-amber-500' : 'bg-slate-200'}`}
                        >
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={b2bFilters.readyToShip}
                                onChange={() =>
                                    setB2bFilters((p) => ({ ...p, readyToShip: !p.readyToShip }))
                                }
                            />
                            <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${b2bFilters.readyToShip ? 'translate-x-4.5' : 'translate-x-1'}`}
                            />
                        </div>
                    </label>
                </div>

                {/* Top Vendors Selection */}
                <div className="space-y-3 border-t border-slate-100 pt-5 pb-4">
                    <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-700 uppercase">
                        Top Verified Brands
                    </h4>
                    <div className="max-h-40 flex flex-col gap-1 overflow-y-auto overflow-x-hidden pr-2 overscroll-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
                        {['all', 'Titan', 'Syska', 'HP', 'Sovely Official'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setB2bFilters((p) => ({ ...p, vendor: v }))}
                                className={`rounded-lg px-3 py-2 text-left text-sm transition-all ${b2bFilters.vendor === v ? 'bg-slate-900 font-extrabold text-white shadow-md' : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                {v === 'all' ? 'All Vendors' : v}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
