import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UploadCloud,
    FileSpreadsheet,
    Download,
    AlertCircle,
    CheckCircle2,
    Trash2,
    ShoppingCart,
    ArrowRight,
    ListPlus,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';

const BulkUpload = () => {
    const navigate = useNavigate();
    const { addToCart, isLoading } = useCartStore();

    const [activeTab, setActiveTab] = useState('UPLOAD'); // 'UPLOAD' or 'PASTE'
    const [parsedData, setParsedData] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const fileInputRef = useRef(null);

    // --- CSV Parsing Logic (Vanilla JS) ---
    const processCSVText = (text) => {
        try {
            const lines = text.split('\n');
            const results = [];

            // Assuming first row might be headers: SKU, Quantity
            const startIndex = lines[0].toLowerCase().includes('sku') ? 1 : 0;

            for (let i = startIndex; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                const cols = lines[i].split(',');
                const sku = cols[0]?.trim();
                const qty = parseInt(cols[1]?.trim(), 10);

                if (sku && !isNaN(qty) && qty > 0) {
                    results.push({ sku, qty, status: 'pending' });
                }
            }

            if (results.length === 0) throw new Error('No valid SKU/Quantity pairs found.');

            setParsedData(results);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to parse data. Ensure format is SKU,Quantity');
        }
    };

    // --- File Handlers ---
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setError('Please upload a valid .csv file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => processCSVText(event.target.result);
        reader.readAsText(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            if (fileInputRef.current) {
                fileInputRef.current.files = dataTransfer.files;
                const event = new Event('change', { bubbles: true });
                fileInputRef.current.dispatchEvent(event);
            }
        }
    };

    // --- Manual Paste Handler ---
    const handleManualSubmit = () => {
        processCSVText(manualInput);
    };

    // --- Cart Integration ---
    const processBulkOrder = async () => {
        setError('');
        setSuccessMsg('');

        if (parsedData.length === 0) return;

        let successCount = 0;
        let failCount = 0;

        // Note: For a true production app, you'd want a bulk POST endpoint on your backend.
        // Here we are looping the addToCart store action for demonstration.
        for (const item of parsedData) {
            try {
                // We assume 'WHOLESALE' for bulk uploads
                // If your backend maps SKUs instead of Product IDs, you'll need an endpoint that resolves SKUs first!
                const res = await addToCart(item.sku, item.qty, 'WHOLESALE', 0);
                if (res.success) {
                    successCount++;
                    setParsedData((prev) =>
                        prev.map((p) => (p.sku === item.sku ? { ...p, status: 'success' } : p))
                    );
                } else {
                    failCount++;
                    setParsedData((prev) =>
                        prev.map((p) => (p.sku === item.sku ? { ...p, status: 'error' } : p))
                    );
                }
            } catch (err) {
                failCount++;
                setParsedData((prev) =>
                    prev.map((p) => (p.sku === item.sku ? { ...p, status: 'error' } : p))
                );
            }
        }

        if (successCount > 0) {
            setSuccessMsg(`Successfully added ${successCount} items to your procurement cart.`);
            setTimeout(() => navigate('/checkout'), 2000);
        }
        if (failCount > 0) {
            setError(`Failed to add ${failCount} items. Check if SKUs are correct and in stock.`);
        }
    };

    const removeRow = (indexToRemove) => {
        setParsedData(parsedData.filter((_, idx) => idx !== indexToRemove));
    };

    const downloadTemplate = () => {
        const csvContent = 'data:text/csv;charset=utf-8,SKU,Quantity\nITEM-001,50\nITEM-002,100\n';
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'sovely_bulk_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="mx-auto mb-20 w-full max-w-5xl px-4 py-8 font-sans md:mb-0 md:py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    Quick Procure
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    Upload a CSV or paste your SKUs to instantly build your wholesale cart.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Left: Input Area */}
                <div className="space-y-6 lg:col-span-5">
                    <div className="flex rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
                        <button
                            onClick={() => setActiveTab('UPLOAD')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all ${activeTab === 'UPLOAD' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <UploadCloud size={18} /> CSV Upload
                        </button>
                        <button
                            onClick={() => setActiveTab('PASTE')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all ${activeTab === 'PASTE' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <ListPlus size={18} /> Quick Paste
                        </button>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        {activeTab === 'UPLOAD' ? (
                            <div className="space-y-4">
                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                                >
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                    <FileSpreadsheet
                                        size={40}
                                        className={`mb-3 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`}
                                    />
                                    <p className="text-sm font-extrabold text-slate-700">
                                        Drag & Drop your CSV here
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-500">
                                        or click to browse files
                                    </p>
                                </div>
                                <button
                                    onClick={downloadTemplate}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 py-3 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-100"
                                >
                                    <Download size={16} /> Download CSV Template
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800">
                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                    <p>
                                        Format: One item per line as{' '}
                                        <span className="rounded border border-amber-200 bg-white px-1 font-mono">
                                            SKU,Quantity
                                        </span>
                                    </p>
                                </div>
                                <textarea
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    placeholder="ITEM-A123, 50&#10;ITEM-B456, 150"
                                    className="custom-scrollbar h-48 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-700 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleManualSubmit}
                                    disabled={!manualInput.trim()}
                                    className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                                >
                                    Process Text
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Preview & Execution */}
                <div className="lg:col-span-7">
                    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                                <ShoppingCart size={20} className="text-slate-400" /> Order Preview
                            </h3>
                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-extrabold tracking-wider text-slate-500 uppercase">
                                {parsedData.length} Valid Rows
                            </span>
                        </div>

                        {error && (
                            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                                <AlertCircle size={16} className="shrink-0" /> <p>{error}</p>
                            </div>
                        )}

                        {successMsg && (
                            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
                                <CheckCircle2 size={16} className="shrink-0" /> <p>{successMsg}</p>
                            </div>
                        )}

                        {parsedData.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-slate-400">
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                                    <FileSpreadsheet size={32} className="text-slate-300" />
                                </div>
                                <p className="font-extrabold text-slate-600">No data loaded</p>
                                <p className="mt-1 max-w-[250px] text-sm">
                                    Upload a file or paste SKUs to see your order preview here.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="custom-scrollbar max-h-[400px] flex-1 overflow-hidden overflow-y-auto rounded-2xl border border-slate-100">
                                    <table className="w-full text-left text-sm text-slate-600">
                                        <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-extrabold text-slate-500 uppercase shadow-sm">
                                            <tr>
                                                <th className="px-4 py-3">SKU</th>
                                                <th className="px-4 py-3 text-center">Qty</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                                <th className="px-4 py-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {parsedData.map((row, idx) => (
                                                <tr
                                                    key={idx}
                                                    className="transition-colors hover:bg-slate-50"
                                                >
                                                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                                        {row.sku}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold text-slate-900">
                                                        {row.qty}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {row.status === 'pending' && (
                                                            <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 uppercase">
                                                                Ready
                                                            </span>
                                                        )}
                                                        {row.status === 'success' && (
                                                            <span className="mx-auto flex w-fit items-center justify-center gap-1 rounded bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700 uppercase">
                                                                <CheckCircle2 size={10} /> Added
                                                            </span>
                                                        )}
                                                        {row.status === 'error' && (
                                                            <span className="mx-auto flex w-fit items-center justify-center gap-1 rounded bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700 uppercase">
                                                                <AlertCircle size={10} /> Failed
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => removeRow(idx)}
                                                            disabled={
                                                                isLoading ||
                                                                row.status === 'success'
                                                            }
                                                            className="text-slate-400 transition-colors hover:text-red-500 disabled:opacity-30"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-6 border-t border-slate-100 pt-6">
                                    <button
                                        onClick={processBulkOrder}
                                        disabled={isLoading || parsedData.length === 0}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-extrabold tracking-widest text-white uppercase shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 disabled:opacity-50"
                                    >
                                        {isLoading
                                            ? 'Processing Bulk Order...'
                                            : 'Add All to Procurement Cart'}{' '}
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkUpload;
