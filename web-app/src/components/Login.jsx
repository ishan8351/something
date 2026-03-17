import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Login = () => {
    const [loginMethod, setLoginMethod] = useState('email');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login, loginWithOtpReq, sendOtp } = useContext(AuthContext);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleSendOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10)
            return setError('Please enter a valid phone number');
        setError('');
        setIsLoading(true);
        const res = await sendOtp(phoneNumber, true);
        setIsLoading(false);

        if (res.success) {
            setOtpSent(true);
            setCooldown(30);
        } else {
            setError(res.message);
        }
    };

    const handleTabSwitch = (method) => {
        setLoginMethod(method);
        setError('');
        setOtpSent(false);
        setOtpCode('');
        setCooldown(0);
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await login(email, password);
            if (response.success) navigate('/');
            else throw new Error(response.message || 'Invalid credentials');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await loginWithOtpReq(phoneNumber, otpCode);
            if (response.success) navigate('/');
            else throw new Error(response.message || 'Invalid OTP');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="selection:bg-accent/30 relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4 font-sans">
            {}
            <div className="bg-accent/20 animate-blob absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full opacity-70 mix-blend-multiply blur-3xl filter"></div>
            <div className="animate-blob animation-delay-2000 absolute right-[-10%] bottom-[-10%] h-96 w-96 rounded-full bg-pink-300/20 opacity-70 mix-blend-multiply blur-3xl filter"></div>

            <div className="relative z-10 w-full max-w-md rounded-[2.5rem] border border-white bg-white/80 p-8 shadow-2xl backdrop-blur-xl md:p-10">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-900"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        ></path>
                    </svg>
                    Back
                </button>

                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        Welcome Back
                    </h1>
                    <p className="font-medium text-slate-500">
                        Sign in to access your curated collection.
                    </p>
                </div>

                {}
                <div className="mb-8 flex rounded-2xl bg-slate-100 p-1">
                    <button
                        type="button"
                        onClick={() => handleTabSwitch('email')}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${loginMethod === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Email
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabSwitch('phone')}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${loginMethod === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Mobile Number
                    </button>
                </div>

                {error && (
                    <div className="bg-danger/10 border-danger/20 text-danger mb-6 animate-[fadeIn_0.3s_ease-out] rounded-2xl border p-4 text-center text-sm font-bold">
                        {error}
                    </div>
                )}

                {}
                {loginMethod === 'email' && (
                    <form
                        onSubmit={handleEmailLogin}
                        autoComplete="off"
                        className="animate-[fadeIn_0.3s_ease-out] space-y-5"
                    >
                        <div className="space-y-2">
                            <label className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="off"
                                required
                                className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:ring-1"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                                className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium tracking-widest text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:ring-1"
                            />
                        </div>
                        <div className="flex items-center justify-between pt-2 pb-4">
                            <label className="group flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="text-accent focus:ring-accent/30 h-4 w-4 cursor-pointer rounded border-slate-300"
                                />
                                <span className="text-sm font-medium text-slate-600 transition-colors group-hover:text-slate-900">
                                    Remember me
                                </span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-accent text-sm font-bold transition-colors hover:text-slate-900"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="hover:bg-accent hover:shadow-accent/30 w-full rounded-2xl bg-slate-900 py-4 font-bold tracking-wide text-white transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                )}

                {}
                {loginMethod === 'phone' && (
                    <form
                        onSubmit={
                            otpSent
                                ? handleOtpLogin
                                : (e) => {
                                      e.preventDefault();
                                      handleSendOtp();
                                  }
                        }
                        autoComplete="off"
                        className="animate-[fadeIn_0.3s_ease-out] space-y-5"
                    >
                        <div className="space-y-2">
                            <label className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <span className="absolute top-1/2 left-5 -translate-y-1/2 font-bold text-slate-400">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="Enter 10 digit number"
                                    value={phoneNumber}
                                    onChange={(e) =>
                                        setPhoneNumber(e.target.value.replace(/\D/g, ''))
                                    }
                                    disabled={otpSent && cooldown > 0}
                                    autoComplete="off"
                                    required
                                    className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-5 pl-14 text-sm font-bold text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:ring-1 disabled:bg-slate-100 disabled:opacity-60"
                                />
                            </div>
                        </div>

                        {otpSent && (
                            <div className="animate-[fadeIn_0.3s_ease-out] space-y-2">
                                <label className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    Enter 4-Digit OTP
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="4"
                                        placeholder="1234"
                                        value={otpCode}
                                        onChange={(e) =>
                                            setOtpCode(e.target.value.replace(/\D/g, ''))
                                        }
                                        autoFocus
                                        required
                                        className="focus:border-accent focus:ring-accent flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-center text-lg font-extrabold tracking-widest text-slate-900 transition-all outline-none placeholder:font-medium placeholder:text-slate-300 focus:ring-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={cooldown > 0 || isLoading}
                                        className="min-w-[120px] rounded-2xl border border-slate-200 bg-white px-5 font-bold whitespace-nowrap text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            {!otpSent ? (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="hover:bg-accent hover:shadow-accent/30 w-full rounded-2xl bg-slate-900 py-4 font-bold tracking-wide text-white transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isLoading ? 'Sending...' : 'Get OTP'}
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isLoading || otpCode.length < 4}
                                    className="hover:bg-accent hover:shadow-accent/30 w-full rounded-2xl bg-slate-900 py-4 font-bold tracking-wide text-white transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                                </button>
                            )}
                        </div>
                    </form>
                )}

                <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                    <p className="text-sm font-medium text-slate-500">
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            className="hover:text-accent font-bold text-slate-900 transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
