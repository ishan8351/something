import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/routes';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-slate-50 selection:bg-accent/30 tracking-tight">
            {/* Hero Section */}
            <section className="relative px-6 py-24 md:px-12 lg:px-24 mx-auto max-w-7xl overflow-hidden">
                <div className="relative z-10 max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-8">
                        Redefining <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">
                            B2B Commerce.
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                        Sovely is the premier digital infrastructure for modern merchants. We bridge the gap between world-class manufacturing and ambitious retail entrepreneurs, providing a seamless ecosystem for wholesale sourcing and automated dropshipping.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to={ROUTES.CATALOG} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                            Explore Catalog
                        </Link>
                        <Link to={ROUTES.BECOME_SELLER || '#'} className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-colors">
                            Partner With Us
                        </Link>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="bg-white py-24 px-6 md:px-12 lg:px-24 border-y border-slate-100">
                <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 mb-6">Our Mission</h2>
                        <p className="text-lg text-slate-600 leading-relaxed mb-6">
                            We observed that starting and scaling an e-commerce business was plagued by supply chain inefficiencies, minimum order constraints, and logistics nightmares. 
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Our mission is to democratize retail. By providing zero-inventory dropshipping, deep wholesale discounts, and a cutting-edge technical platform, Sovely empowers anyone to build an empire from their laptop.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-3xl hover:shadow-xl transition-shadow">
                            <h3 className="text-4xl font-black text-blue-600 mb-2">10k+</h3>
                            <p className="font-bold text-slate-900">Verified Resellers</p>
                            <p className="text-sm text-slate-500 mt-2 font-medium">Trust our infrastructure daily.</p>
                        </div>
                        <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-3xl transform md:translate-y-8 hover:shadow-xl transition-shadow">
                            <h3 className="text-4xl font-black text-emerald-600 mb-2">5M+</h3>
                            <p className="font-bold text-slate-900">Products Shipped</p>
                            <p className="text-sm text-slate-500 mt-2 font-medium">Delivered across India seamlessly.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
