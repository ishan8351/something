import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DropshipProducts from './DropshipProducts';
import B2BFilterBar from './B2BFilterBar';
import { SlidersHorizontal } from 'lucide-react';

function LandingPage() {
    const [searchParams] = useSearchParams();
    const globalSearchQuery = searchParams.get('search') || '';

    // Notice we included the 'lowRtoRisk' state to match your updated filter bar
    const [b2bFilters, setB2bFilters] = useState({
        moq: 'all',
        margin: 'all',
        readyToShip: false,
        lowRtoRisk: false,
    });

    const handleFilterChange = (key, value) => {
        setB2bFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-50">
            <main className="flex w-full flex-1 flex-col pb-12">
                {/* 1. Sticky Header & Filter Command Center */}
                <div className="sticky top-0 z-30 w-full border-b border-slate-200/60 bg-white/90 pt-6 pb-4 shadow-sm backdrop-blur-xl">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900">
                                    <SlidersHorizontal className="text-emerald-600" size={24} />
                                    B2B Catalog
                                </h1>
                                <p className="mt-1 text-sm font-medium text-slate-500">
                                    {globalSearchQuery
                                        ? `Showing results for "${globalSearchQuery}"`
                                        : 'Source inventory tailored to your business needs.'}
                                </p>
                            </div>

                            {/* Filters pushed cleanly to the right */}
                            <B2BFilterBar
                                filters={b2bFilters}
                                onFilterChange={handleFilterChange}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Pure Product Grid */}
                <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
                    <DropshipProducts filters={b2bFilters} globalSearchQuery={globalSearchQuery} />
                </div>
            </main>
        </div>
    );
}

export default LandingPage;
