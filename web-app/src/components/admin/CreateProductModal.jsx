import React, { useState } from 'react';
import { X, Upload, Loader2, Package } from 'lucide-react';
import api from '../../utils/api.js';

const CreateProductModal = ({ isOpen, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        sku: '',
        platformSellPrice: '',
        stock: '',
        moq: '1',
        status: 'active',
        descriptionHTML: '',
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 8);
        setImages(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });

        images.forEach((image) => {
            data.append('images', image);
        });

        try {
            await api.post('/products/admin/create', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onSuccess();
            onClose();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Failed to create product: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 p-6 backdrop-blur">
                    <h3 className="text-xl font-black text-slate-900">Create B2B Product</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                Product Title *
                            </label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="focus:border-accent rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 outline-none"
                                placeholder="e.g. Wireless Headphones"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                SKU *
                            </label>
                            <input
                                required
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className="focus:border-accent rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 outline-none"
                                placeholder="e.g. WH-001"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                Wholesale Price (₹) *
                            </label>
                            <input
                                required
                                type="number"
                                name="platformSellPrice"
                                value={formData.platformSellPrice}
                                onChange={handleChange}
                                className="focus:border-accent rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 outline-none"
                                placeholder="0.00"
                            />
                        </div>

                        {}
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                <Package size={14} /> Min Order Qty (MOQ)
                            </label>
                            <input
                                required
                                type="number"
                                min="1"
                                name="moq"
                                value={formData.moq}
                                onChange={handleChange}
                                className="focus:border-accent rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 outline-none"
                                placeholder="10"
                            />
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                Initial Stock *
                            </label>
                            <input
                                required
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className="focus:border-accent rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 outline-none md:w-1/2"
                                placeholder="100"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            Description
                        </label>
                        <textarea
                            name="descriptionHTML"
                            value={formData.descriptionHTML}
                            onChange={handleChange}
                            rows="3"
                            className="focus:border-accent resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 outline-none"
                            placeholder="Product description..."
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            Images (Max 8)
                        </label>
                        <div className="hover:border-accent group relative flex w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition-colors hover:bg-slate-100">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            />
                            <div className="group-hover:text-accent flex flex-col items-center text-slate-500">
                                <Upload size={24} className="mb-2" />
                                <span className="text-sm font-bold">
                                    {images.length > 0
                                        ? `${images.length} files selected`
                                        : 'Click or drag images here'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="hover:bg-accent flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            {isSubmitting ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProductModal;
