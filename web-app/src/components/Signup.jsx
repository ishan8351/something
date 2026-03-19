import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Signup = () => {
    const [contactMethod, setContactMethod] = useState('email');
    const [accountType, setAccountType] = useState('B2C');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [password, setPassword] = useState('');

    const [companyName, setCompanyName] = useState('');
    const [gstin, setGstin] = useState('');

    const [otpSent, setOtpSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { register, sendOtp } = useContext(AuthContext);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const getPasswordStrength = (pass) => {
        if (pass.length === 0) return { width: '0%', color: 'transparent', label: '' };
        if (pass.length < 6) return { width: '33%', color: '#ef4444', label: 'Weak' };
        if (!/\d/.test(pass) || !/[a-zA-Z]/.test(pass))
            return { width: '66%', color: '#f59e0b', label: 'Good' };
        return { width: '100%', color: '#10b981', label: 'Strong' };
    };

    const strength = getPasswordStrength(password);

    const handleTabSwitch = (method) => {
        setContactMethod(method);
        setError('');
        setOtpSent(false);
        setOtpCode('');
        setCooldown(0);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!phoneNumber || phoneNumber.length < 10)
            return setError('Please enter a valid phone number');
        setError('');
        setIsLoading(true);
        const res = await sendOtp(phoneNumber, false);
        setIsLoading(false);

        if (res.success) {
            setOtpSent(true);
            setCooldown(30);
        } else {
            setError(res.message);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        // Strict B2B GSTIN check - ONLY if they selected B2B and provided a GSTIN
        if (accountType === 'B2B' && gstin) {
            const gstinRegex =
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z0-9A-Z]{1}[0-9A-Z]{1}$/;
            if (!gstinRegex.test(gstin.toUpperCase())) {
                return setError('Please enter a valid 15-character GSTIN');
            }
        }

        setError('');
        setIsLoading(true);

        try {
            // Only send the contact method they actually used!
            const userData = {
                name,
                password,
                accountType,
                // Dynamically add email OR phone, not both
                ...(contactMethod === 'email' ? { email } : { phoneNumber }),
                // Only send B2B fields if it's a B2B account
                ...(accountType === 'B2B' && {
                    companyName,
                    gstin: gstin ? gstin.toUpperCase() : undefined,
                }),
            };

            const response = await register(userData);
            if (response.success) {
                if (accountType === 'B2B') {
                    alert(
                        'Business Account Created! You must complete KYC to unlock wholesale features.'
                    );
                } else {
                    alert('Account Created successfully!');
                }
                navigate('/');
            } else {
                throw new Error(response.message || 'Failed to create account.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="selection:bg-accent/30 relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4 py-12 font-sans">
            <div className="bg-accent/20 animate-blob absolute top-[10%] right-[-10%] h-96 w-96 rounded-full opacity-70 mix-blend-multiply blur-3xl filter"></div>
            <div className="animate-blob animation-delay-4000 absolute bottom-[10%] left-[-10%] h-96 w-96 rounded-full bg-pink-300/20 opacity-70 mix-blend-multiply blur-3xl filter"></div>

            <div className="relative z-10 my-8 w-full max-w-md rounded-[2.5rem] border border-white bg-white/80 p-8 shadow-2xl backdrop-blur-xl md:p-10">
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

                <div className="mb-6">
                    <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        Create Account
                    </h1>
                    <p className="font-medium text-slate-500">
                        Join us and start shopping premium collections.
                    </p>
                </div>

                {}
                <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
                    <button
                        type="button"
                        onClick={() => setAccountType('B2C')}
                        className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${accountType === 'B2C' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Individual
                    </button>
                    <button
                        type="button"
                        onClick={() => setAccountType('B2B')}
                        className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${accountType === 'B2B' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Business (B2B)
                    </button>
                </div>

                <div className="mb-8 flex rounded-2xl bg-slate-100 p-1">
                    <button
                        type="button"
                        onClick={() => handleTabSwitch('email')}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${contactMethod === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Use Email
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabSwitch('phone')}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${contactMethod === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Use Mobile
                    </button>
                </div>

                {error && (
                    <div className="bg-danger/10 border-danger/20 text-danger mb-6 animate-[fadeIn_0.3s_ease-out] rounded-2xl border p-4 text-center text-sm font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} autoComplete="off" className="space-y-5">
                    {/* Full Name Field */}
                    <div className="space-y-2">
                        <label className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:ring-1"
                        />
                    </div>

                    {/* Conditional Contact Field (Email vs Phone) */}
                    {contactMethod === 'email' ? (
                        <div className="animate-[fadeIn_0.3s_ease-out] space-y-2">
                            <label className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:ring-1"
                            />
                        </div>
                    ) : (
                        <div className="animate-[fadeIn_0.3s_ease-out] space-y-2">
                            <label className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Mobile Number *
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
                                    maxLength="10"
                                    required
                                    className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-5 pl-14 text-sm font-bold text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:ring-1"
                                />
                            </div>
                        </div>
                    )}

                    {/* Password Field with Strength Indicator */}
                    <div className="space-y-2">
                        <label className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                            Password *
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium tracking-widest text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:ring-1"
                        />
                        {/* Password Strength Bar */}
                        {password.length > 0 && (
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full transition-all duration-300"
                                    style={{
                                        width: strength.width,
                                        backgroundColor: strength.color,
                                    }}
                                ></div>
                            </div>
                        )}
                    </div>

                    {/* Conditional B2B Fields */}
                    {accountType === 'B2B' && (
                        <div className="animate-[fadeIn_0.3s_ease-out] space-y-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                            <div className="space-y-2">
                                <label className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    Company / Store Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Acme Dropshipping"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    required={accountType === 'B2B'}
                                    className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:ring-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="pl-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    GSTIN (Optional for KYC Tier 1)
                                </label>
                                <input
                                    type="text"
                                    placeholder="22AAAAA0000A1Z5"
                                    value={gstin}
                                    onChange={(e) => setGstin(e.target.value)}
                                    maxLength="15"
                                    className="focus:border-accent focus:ring-accent w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-900 uppercase transition-all outline-none placeholder:text-slate-400 focus:ring-1"
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="hover:bg-accent hover:shadow-accent/30 mt-4 w-full rounded-2xl bg-slate-900 py-4 font-bold tracking-wide text-white transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                    <p className="text-sm font-medium text-slate-500">
                        Already have an account?{' '}
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

export default Signup;
