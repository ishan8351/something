import React, { useState, useEffect } from 'react';
import { Search, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api.js';
import CreateProductModal from './CreateProductModal';
import { Plus } from 'lucide-react';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterOption, setFilterOption] = useState('ALL');
    const [priceFilter, setPriceFilter] = useState('ALL');
    const [stockFilter, setStockFilter] = useState('ALL');

    const [updatingId, setUpdatingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, filterOption, priceFilter, stockFilter]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await api.get('/products/admin/all', {
                    params: {
                        page,
                        limit: 10,
                        search: debouncedSearch,
                        status: filterOption,
                        price: priceFilter,
                        stock: stockFilter,
                    },
                });

                setProducts(res.data.data.data);
                setTotalPages(res.data.data.pagination.totalPages);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [page, debouncedSearch, filterOption, priceFilter, stockFilter]);

    const submitProductUpdate = async (id) => {
        setIsSaving(true);
        try {
            const res = await api.put(`/products/admin/${id}`, {
                platformSellPrice: Number(editForm.price),
                stock: Number(editForm.stock),
                moq: Number(editForm.moq),
                status: editForm.status,
            });

            setProducts((prev) => prev.map((p) => (p._id === id ? res.data.data : p)));
            setUpdatingId(null);
        } catch (err) {
            alert('Failed to update product');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="mb-6 flex flex-wrap gap-4">
                <div className="focus-within:border-accent focus-within:ring-accent flex min-w-[250px] flex-1 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:ring-1">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Title or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ml-3 w-full border-none text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                </div>

                <select
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value)}
                    className="focus:border-accent cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm outline-none"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                </select>

                <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="focus:border-accent cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm outline-none"
                >
                    <option value="ALL">All Prices</option>
                    <option value="UNDER_500">Under ₹500</option>
                    <option value="OVER_1000">Over ₹1,000</option>
                </select>

                <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="focus:border-accent cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm outline-none"
                >
                    <option value="ALL">All Stock</option>
                    <option value="IN_STOCK">In Stock ({'>'}10)</option>
                    <option value="LOW_STOCK">Low Stock (1-10)</option>
                    <option value="OUT_OF_STOCK">Out of Stock (0)</option>
                </select>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="hover:bg-accent flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors"
                >
                    <Plus size={18} /> New Product
                </button>
            </div>

            <div className="mb-6 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                <div className="relative min-h-[300px] overflow-x-auto">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 text-slate-400 backdrop-blur-sm">
                            <div className="border-t-accent mb-2 h-8 w-8 animate-spin rounded-full border-4 border-slate-200"></div>
                        </div>
                    )}
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Product
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Price (₹)
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Stock
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Status
                                </th>
                                <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {!loading && products.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-8 text-center font-medium text-slate-500"
                                    >
                                        No products found.
                                    </td>
                                </tr>
                            ) : null}
                            {products.map((p) => {
                                const isEdit = updatingId === p._id;
                                return (
                                    <tr
                                        key={p._id}
                                        className="transition-colors hover:bg-slate-50/50"
                                    >
                                        <td className="p-4">
                                            <div className="max-w-[250px] truncate font-bold text-slate-900">
                                                {p.title}
                                            </div>
                                            <div className="mt-1 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                                                SKU: {p.sku}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {isEdit ? (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-10 text-[10px] font-bold text-slate-400 uppercase">
                                                            Stock
                                                        </span>
                                                        <input
                                                            type="number"
                                                            value={editForm.stock}
                                                            onChange={(e) =>
                                                                setEditForm({
                                                                    ...editForm,
                                                                    stock: e.target.value,
                                                                })
                                                            }
                                                            className="focus:border-accent w-16 rounded border border-slate-300 p-1.5 text-sm font-medium outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-10 text-[10px] font-bold text-slate-400 uppercase">
                                                            MOQ
                                                        </span>
                                                        <input
                                                            type="number"
                                                            value={editForm.moq}
                                                            onChange={(e) =>
                                                                setEditForm({
                                                                    ...editForm,
                                                                    moq: e.target.value,
                                                                })
                                                            }
                                                            className="focus:border-accent w-16 rounded border border-slate-300 p-1.5 text-sm font-medium outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`font-bold ${p.inventory?.stock === 0 ? 'text-red-500' : p.inventory?.stock <= 10 ? 'text-yellow-600' : 'text-slate-900'}`}
                                                    >
                                                        {p.inventory?.stock}{' '}
                                                        <span className="text-[10px] font-medium text-slate-400">
                                                            (In Stock)
                                                        </span>
                                                    </span>
                                                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                                        MOQ:{' '}
                                                        <span className="text-slate-700">
                                                            {p.moq || 1}
                                                        </span>
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {isEdit ? (
                                                <input
                                                    type="number"
                                                    value={editForm.stock}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            stock: e.target.value,
                                                        })
                                                    }
                                                    className="focus:border-accent w-16 rounded border border-slate-300 p-1.5 text-sm font-medium outline-none"
                                                />
                                            ) : (
                                                <span
                                                    className={`font-bold ${p.inventory?.stock === 0 ? 'text-danger' : p.inventory?.stock <= 10 ? 'text-yellow-600' : 'text-slate-900'}`}
                                                >
                                                    {p.inventory?.stock}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {isEdit ? (
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            status: e.target.value,
                                                        })
                                                    }
                                                    className="focus:border-accent rounded border border-slate-300 p-1.5 text-xs font-bold outline-none"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="draft">Draft</option>
                                                </select>
                                            ) : (
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                                                >
                                                    {p.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {isEdit ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        disabled={isSaving}
                                                        onClick={() => submitProductUpdate(p._id)}
                                                        className="hover:bg-accent rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition-colors disabled:opacity-50"
                                                    >
                                                        {isSaving ? '...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={() => setUpdatingId(null)}
                                                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setUpdatingId(p._id);
                                                        setEditForm({
                                                            price: p.platformSellPrice,
                                                            moq: p.moq || 1,
                                                            stock: p.inventory?.stock,
                                                            status: p.status,
                                                        });
                                                    }}
                                                    className="text-accent bg-accent/10 rounded-lg p-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-sm font-bold text-slate-500">
                    Page <span className="text-slate-900">{page}</span> of{' '}
                    <span className="text-slate-900">{totalPages || 1}</span>
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                    className="flex items-center gap-1 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
            <CreateProductModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setPage(1);
                }}
            />
        </>
    );
};

export default AdminProducts;
