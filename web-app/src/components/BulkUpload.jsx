import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../utils/api.js';

const BulkUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage(null);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setMessage(null);
        setError(null);

        try {
            const res = await api.post('/products/admin/bulk-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(`Success! ${res.data.data.total} products processed.`);
            setFile(null);
            document.getElementById('file-upload').value = '';
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload file.');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        window.open('http://localhost:8000/api/v1/products/admin/template', '_blank');
    };

    return (
        <div className="max-w-3xl rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm md:p-12">
            <div className="mb-10 text-center">
                <div className="bg-accent/10 mb-4 inline-flex rounded-full p-4">
                    <Upload size={32} className="text-accent" />
                </div>
                <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">
                    Bulk Product Upload
                </h2>
                <p className="font-medium text-slate-500">
                    Upload your product catalog using a CSV or Excel file.
                </p>
            </div>

            <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div
                    onClick={handleDownloadTemplate}
                    className="hover:bg-accent/5 hover:border-accent group cursor-pointer rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition-all"
                >
                    <Download
                        size={28}
                        className="group-hover:text-accent mx-auto mb-4 text-slate-400 transition-colors"
                    />
                    <h4 className="mb-2 font-extrabold text-slate-900">Step 1: Get Template</h4>
                    <p className="text-sm leading-relaxed font-medium text-slate-500">
                        Download our empty sample CSV to ensure correct formatting.
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-slate-100 bg-white p-8 text-center shadow-sm">
                    <FileText size={28} className="mx-auto mb-4 text-slate-400" />
                    <h4 className="mb-4 font-extrabold text-slate-900">Step 2: Fill & Upload</h4>
                    <input
                        type="file"
                        id="file-upload"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label
                        htmlFor="file-upload"
                        className="inline-block w-full cursor-pointer truncate rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
                    >
                        {file ? file.name : 'Choose File'}
                    </label>
                </div>
            </div>

            {error && (
                <div className="bg-danger/10 border-danger/20 text-danger mb-8 flex animate-[fadeIn_0.3s_ease-out] items-center gap-3 rounded-2xl border p-4">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span className="text-sm font-bold">{error}</span>
                </div>
            )}

            {message && (
                <div className="mb-8 flex animate-[fadeIn_0.3s_ease-out] items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
                    <CheckCircle size={20} className="flex-shrink-0" />
                    <span className="text-sm font-bold">{message}</span>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="hover:bg-accent hover:shadow-accent/30 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-bold tracking-wide text-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {uploading ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                    </>
                ) : (
                    'Upload and Sync Catalog'
                )}
            </button>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h5 className="mb-3 flex items-center gap-2 font-extrabold text-amber-900">
                    <AlertCircle size={18} /> Data Formatting Tips
                </h5>
                <ul className="list-outside list-disc space-y-1 pl-5 text-sm leading-relaxed font-medium text-amber-800">
                    <li>
                        The <strong className="font-black">SKU</strong> is used to identify
                        products; existing SKUs will be updated.
                    </li>
                    <li>
                        For categories, use{' '}
                        <strong className="font-black">Level 1 {'>'} Level 2</strong> format (e.g.,
                        Electronics {'>'} Phones).
                    </li>
                    <li>
                        Multiple images can be added by using the same Handle across multiple rows.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default BulkUpload;
