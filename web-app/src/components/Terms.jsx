import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
    const navigate = useNavigate();

    return (
        <div className="selection:bg-accent/30 min-h-screen bg-slate-50 px-4 py-12 font-sans">
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl md:p-12">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-900"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900">
                    Terms of Service
                </h1>
                <p className="mb-8 text-sm font-medium text-slate-500">
                    Last Updated: March 24, 2026
                </p>

                <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
                    <section>
                        <h2 className="mb-3 text-xl font-bold text-slate-900">
                            1. Agreement to Terms
                        </h2>
                        <p className="leading-relaxed">
                            By accessing or using the Sovely B2B platform ("Platform"), you agree to
                            be bound by these Terms of Service. If you do not agree to these terms,
                            please do not use our services. This platform is strictly intended for
                            business-to-business (B2B) transactions.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-xl font-bold text-slate-900">
                            2. Business Accounts & KYC
                        </h2>
                        <p className="leading-relaxed">
                            To unlock wholesale features, users must complete our Know Your Customer
                            (KYC) process, which may include providing a valid GSTIN and business
                            registration documents. Sovely reserves the right to suspend or
                            terminate accounts that provide falsified documentation.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-xl font-bold text-slate-900">
                            3. Purchasing & Payments
                        </h2>
                        <p className="leading-relaxed">
                            All transactions are subject to availability. Prices displayed are
                            exclusive of applicable taxes unless otherwise noted. Wallet balances
                            and credits hold no cash value outside of the Sovely ecosystem and are
                            non-transferable.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-xl font-bold text-slate-900">
                            4. Shipping & Fulfillment
                        </h2>
                        <p className="leading-relaxed">
                            While we strive for prompt dispatch, delivery timelines are estimates.
                            Sovely is not liable for downstream supply chain delays. Dropshipping
                            integrators are responsible for managing their own customer expectations
                            regarding transit times.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-xl font-bold text-slate-900">
                            5. Limitation of Liability
                        </h2>
                        <p className="leading-relaxed">
                            In no event shall Sovely, its directors, or employees be liable for any
                            indirect, consequential, or incidental damages arising out of your use
                            of the platform or inability to procure goods.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
