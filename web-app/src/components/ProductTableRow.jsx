import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Clock, TrendingUp, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function ProductTableRow({ product }) {
    const addToCart = useCartStore((state) => state.addToCart);
    const [currentQty, setCurrentQty] = useState(product.moq);
    const [isAdded, setIsAdded] = useState(false);

    const handleQtyChange = (newQty) => {
        if (newQty < product.moq) return;
        setCurrentQty(newQty);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAdded(true);
        await addToCart(product.id, currentQty, 'WHOLESALE', 0);
        setTimeout(() => setIsAdded(false), 1800);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="group flex flex-col border-b border-slate-100 p-4 transition-colors last:border-0 hover:bg-slate-50/50 md:grid md:grid-cols-[auto_1fr_120px_120px_120px_160px] md:items-center md:gap-4 md:p-3"
        >
            <div className="hidden h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
            </div>

            <div className="flex min-w-0 flex-col justify-center">
                <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                        SKU: {product.skuId}
                    </span>
                    {product.isVerified && (
                        <ShieldCheck size={14} className="text-blue-500" title="Verified Vendor" />
                    )}
                </div>
                <Link
                    to={`/product/${product.id}`}
                    className="truncate text-sm font-bold text-slate-900 transition-colors hover:text-emerald-600"
                >
                    {product.name}
                </Link>
                <span className="truncate text-xs font-medium text-slate-500">
                    By {product.vendor}
                </span>
            </div>

            <div className="hidden flex-col items-center justify-center md:flex">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <Clock size={14} className="text-slate-400" /> {product.dispatchDays} Days
                </span>
                <span className="text-xs font-medium text-slate-500">Stock: {product.stock}</span>
            </div>

            <div className="hidden flex-col items-center justify-center md:flex">
                <span className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                    <TrendingUp size={14} /> {product.margin}%
                </span>
                <span className="text-xs font-medium text-slate-500">{product.gst}% GST</span>
            </div>

            <div className="hidden flex-col items-end justify-center md:flex">
                <span className="text-base font-extrabold text-slate-900">
                    ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-medium text-slate-400 line-through">
                    MRP: ₹{product.originalPrice}
                </span>
            </div>

            <div className="mt-4 flex flex-col gap-2 md:mt-0">
                <div className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-2">
                    <button
                        onClick={() => handleQtyChange(currentQty - product.moq)}
                        className="text-slate-400 hover:text-slate-900"
                    >
                        <Minus size={14} />
                    </button>
                    <input
                        type="number"
                        value={currentQty}
                        onChange={(e) => handleQtyChange(parseInt(e.target.value) || product.moq)}
                        className="w-12 text-center text-sm font-bold text-slate-900 outline-none"
                        min={product.moq}
                        step={product.moq}
                    />
                    <button
                        onClick={() => handleQtyChange(currentQty + product.moq)}
                        className="text-slate-400 hover:text-slate-900"
                    >
                        <Plus size={14} />
                    </button>
                </div>
                <button
                    onClick={handleAdd}
                    className={`flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all ${isAdded ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                    {isAdded ? (
                        <>
                            <Check size={14} /> Added
                        </>
                    ) : (
                        'Quick Add'
                    )}
                </button>
            </div>
        </motion.div>
    );
}
