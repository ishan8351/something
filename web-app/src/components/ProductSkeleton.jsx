import React from 'react';

export default function ProductSkeleton({ viewMode }) {
    if (viewMode === 'table') {
        return (
            <div className="flex animate-pulse items-center gap-4 border-b border-slate-100 px-4 py-3">
                <div className="h-12 w-12 rounded-lg bg-slate-100"></div>
                <div className="flex-1 space-y-2.5">
                    <div className="h-3 w-1/3 rounded bg-slate-100"></div>
                    <div className="h-2 w-1/4 rounded bg-slate-100"></div>
                </div>
                <div className="w-24 space-y-2.5">
                    <div className="h-3 w-full rounded bg-slate-100"></div>
                    <div className="h-2 w-2/3 rounded bg-slate-100"></div>
                </div>
                <div className="w-24 space-y-2.5">
                    <div className="h-3 w-full rounded bg-slate-100"></div>
                    <div className="h-2 w-2/3 rounded bg-slate-100"></div>
                </div>
                <div className="w-32">
                    <div className="h-9 w-full rounded-lg bg-slate-100"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex animate-pulse flex-col rounded-xl border border-slate-100 p-4">
            <div className="mb-4 aspect-square rounded-lg bg-slate-100"></div>
            <div className="mb-3 h-3 w-1/2 rounded bg-slate-100"></div>
            <div className="mb-5 h-4 w-3/4 rounded bg-slate-100"></div>
            <div className="mt-auto flex justify-between">
                <div className="h-5 w-1/3 rounded bg-slate-100"></div>
                <div className="h-5 w-1/4 rounded bg-slate-100"></div>
            </div>
            <div className="mt-4 h-9 w-full rounded-lg bg-slate-100"></div>
        </div>
    );
}
