import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DropshipProducts from './DropshipProducts';
import { Search, ArrowLeft } from 'lucide-react';

function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [selectedCat, setSelectedCat] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [query]);

    if (!query) {
        return (
            <div className="mx-auto w-full max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Search size={32} />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-900">
                    What are you looking to source?
                </h2>
                <p className="mx-auto mb-8 max-w-md text-slate-500">
                    Use the search bar above to find specific wholesale products, brands, or SKUs.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-primary hover:bg-primary-light inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold text-white transition-colors"
                >
                    <ArrowLeft size={18} /> Return to Catalog
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in z-10 mx-auto w-full max-w-7xl px-4 py-8 duration-300 sm:px-6 lg:px-8 lg:py-12">
            {}
            <div className="mb-8 border-b border-slate-200 pb-6">
                <p className="text-primary mb-2 text-sm font-bold tracking-wider uppercase">
                    Search Results
                </p>
                <h1 className="text-3xl font-extrabold text-slate-900">Matches for "{query}"</h1>
                <p className="mt-2 text-slate-500">
                    Showing wholesale availability and bulk pricing.
                </p>
            </div>

            <DropshipProducts
                externalCategory={selectedCat}
                onCategoryChange={setSelectedCat}
                globalSearchQuery={query}
                hideTitle={true}
            />
        </div>
    );
}

export default SearchResults;
