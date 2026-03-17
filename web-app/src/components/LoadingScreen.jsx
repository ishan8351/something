import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="selection:bg-accent/30 flex min-h-screen items-center justify-center bg-slate-50 font-sans">
            <div className="flex animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] flex-col items-center gap-6">
                <svg
                    width="60"
                    height="60"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-lg"
                >
                    <circle cx="25" cy="25" r="20" className="stroke-slate-200" strokeWidth="4" />
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        className="stroke-accent origin-center animate-spin"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="125"
                        strokeDashoffset="100"
                    />
                </svg>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Loading Sovely...
                </h2>
            </div>
        </div>
    );
};

export default LoadingScreen;
