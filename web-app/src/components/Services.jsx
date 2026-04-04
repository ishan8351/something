import React from 'react';

const services = [
    {
        id: 1,
        icon: '🏭',
        title: 'B2B Wholesale Hub',
        description: 'Direct access to factory-rate inventory.',
        detailedInfo:
            'Source thousands of high-quality products directly from verified manufacturers at unbeatable wholesale prices. Perfect for scaling your retail business.',
        color: 'from-blue-500/20 to-blue-600/5',
        iconColor: 'text-blue-500',
        borderColor: 'border-blue-500/20',
    },
    {
        id: 2,
        icon: '📦',
        title: 'Automated Dropshipping',
        description: 'We handle fulfillment so you can sell.',
        detailedInfo:
            'Zero inventory risk. You sell on your preferred channels, and Sovely ships directly to your end customers with white-label packaging.',
        color: 'from-emerald-500/20 to-emerald-600/5',
        iconColor: 'text-emerald-500',
        borderColor: 'border-emerald-500/20',
    },
    {
        id: 3,
        icon: '⚡',
        title: 'Fast-Track Logistics',
        description: 'Next generation express delivery.',
        detailedInfo:
            'Leverage our extensive supply chain network for rapid 48-hour dispatch and express tier shipping options across the entire country.',
        color: 'from-amber-500/20 to-amber-600/5',
        iconColor: 'text-amber-500',
        borderColor: 'border-amber-500/20',
    },
];

function Services() {
    return (
        <section className="bg-slate-50 py-24 px-6 md:px-12 lg:px-24 min-h-screen">
            <div className="mx-auto max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                        Powering Your <br className="sm:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">
                            E-Commerce Empire
                        </span>
                    </h2>
                    <p className="mt-6 text-xl font-medium text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Sovely provides the extreme end-to-end infrastructure you need to source globally, sell locally, and scale without boundaries.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <div 
                            key={service.id}
                            className={`group relative overflow-hidden rounded-3xl border ${service.borderColor} bg-white p-8 transition-all hover:shadow-2xl hover:-translate-y-2 duration-300`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}></div>
                            
                            <div className="relative z-10 w-full h-full flex flex-col">
                                <div className={`flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-3xl mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{service.title}</h3>
                                <p className="text-slate-800 font-bold mb-4">{service.description}</p>
                                <p className="text-md text-slate-500 leading-relaxed flex-grow font-medium">
                                    {service.detailedInfo}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Services;
