import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');

    const handleSendOTP = (e) => {
        e.preventDefault();
        if (email) {
            setStep(2);
        }
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();

        setStep(3);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();

        alert('Password reset successfully! You can now log in.');
        window.location.href = '/login';
    };

    return (
        <div className="selection:bg-accent/30 relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4 font-sans">
            {}
            <div className="bg-accent/20 animate-blob absolute top-[10%] right-[10%] h-96 w-96 rounded-full opacity-70 mix-blend-multiply blur-3xl filter"></div>
            <div className="animate-blob animation-delay-2000 absolute bottom-[10%] left-[10%] h-96 w-96 rounded-full bg-pink-300/20 opacity-70 mix-blend-multiply blur-3xl filter"></div>

            <div className="relative z-10 w-full max-w-md rounded-[2.5rem] border border-white bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl md:p-10">
                <Link to="/" className="group mb-8 inline-flex items-center gap-2">
                    <span className="text-3xl transition-transform group-hover:scale-110">🛒</span>
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                        Sovely
                    </span>
                </Link>

                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        Reset Password
                    </h1>
                    <p className="font-medium text-slate-500">
                        {step === 1 && 'Enter your email to receive an OTP'}
                        {step === 2 && 'Enter the OTP sent to your email'}
                        {step === 3 && 'Create a new password'}
                    </p>
                </div>

                {step === 1 && (
                    <form
                        onSubmit={handleSendOTP}
                        className="animate-[fadeIn_0.3s_ease-out] space-y-6 text-left"
                    >
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:ring-1"
                            />
                        </div>
                        <button
                            type="submit"
                            className="hover:bg-accent hover:shadow-accent/30 w-full rounded-2xl bg-slate-900 py-4 font-bold tracking-wide text-white transition-all duration-300 hover:shadow-lg"
                        >
                            Send OTP
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form
                        onSubmit={handleVerifyOTP}
                        className="animate-[fadeIn_0.3s_ease-out] space-y-6 text-left"
                    >
                        <div className="space-y-2">
                            <label
                                htmlFor="otp"
                                className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase"
                            >
                                One-Time Password (OTP)
                            </label>
                            <input
                                type="text"
                                id="otp"
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                                required
                                className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-center text-2xl font-extrabold tracking-widest text-slate-900 transition-all outline-none placeholder:text-sm placeholder:font-medium placeholder:text-slate-300 focus:ring-1"
                            />
                        </div>
                        <button
                            type="submit"
                            className="hover:bg-accent hover:shadow-accent/30 w-full rounded-2xl bg-slate-900 py-4 font-bold tracking-wide text-white transition-all duration-300 hover:shadow-lg"
                        >
                            Verify OTP
                        </button>
                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-accent text-sm font-bold transition-colors hover:text-slate-900"
                            >
                                Resend OTP
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form
                        onSubmit={handleResetPassword}
                        className="animate-[fadeIn_0.3s_ease-out] space-y-6 text-left"
                    >
                        <div className="space-y-2">
                            <label
                                htmlFor="new-password"
                                className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase"
                            >
                                New Password
                            </label>
                            <input
                                type="password"
                                id="new-password"
                                placeholder="Create a strong password"
                                required
                                className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium tracking-widest text-slate-900 transition-all outline-none placeholder:tracking-normal placeholder:text-slate-400 focus:ring-1"
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="confirm-password"
                                className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase"
                            >
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirm-password"
                                placeholder="Confirm your new password"
                                required
                                className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium tracking-widest text-slate-900 transition-all outline-none placeholder:tracking-normal placeholder:text-slate-400 focus:ring-1"
                            />
                        </div>
                        <button
                            type="submit"
                            className="hover:bg-accent hover:shadow-accent/30 w-full rounded-2xl bg-slate-900 py-4 font-bold tracking-wide text-white transition-all duration-300 hover:shadow-lg"
                        >
                            Reset Password
                        </button>
                    </form>
                )}

                <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                    <p className="text-sm font-medium text-slate-500">
                        Remember your password?{' '}
                        <Link
                            to="/login"
                            className="hover:text-accent font-bold text-slate-900 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
