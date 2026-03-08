import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Auth.css';

const Signup = () => {
    const [contactMethod, setContactMethod] = useState('email');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [password, setPassword] = useState('');
    
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
        if (!/\d/.test(pass) || !/[a-zA-Z]/.test(pass)) return { width: '66%', color: '#f59e0b', label: 'Good' }; 
        return { width: '100%', color: '#10b981', label: 'Strong' }; 
    };

    const strength = getPasswordStrength(password);

    const handleSendOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) return setError("Please enter a valid phone number");
        setError('');
        setIsLoading(true);
        const res = await sendOtp(phoneNumber, false); // false = signup OTP
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
        setError('');
        setIsLoading(true);

        try {
            const userData = {
                name,
                password,
                ...(contactMethod === 'email' ? { email } : { phoneNumber, otpCode })
            };

            const response = await register(userData);
            if (response.success) navigate('/');
            else throw new Error(response.message || "Registration failed");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', padding: 0 }}>
                    ← Back
                </button>
                
                <div className="auth-header">
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join us and start shopping</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button type="button" onClick={() => { setContactMethod('email'); setError(''); }} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px', background: contactMethod === 'email' ? '#000' : '#fff', color: contactMethod === 'email' ? '#fff' : '#000', cursor: 'pointer' }}>Use Email</button>
                    <button type="button" onClick={() => { setContactMethod('phone'); setError(''); }} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px', background: contactMethod === 'phone' ? '#000' : '#fff', color: contactMethod === 'phone' ? '#fff' : '#000', cursor: 'pointer' }}>Use Mobile</button>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                {/* Form set to turn off strict autofill */}
                <form className="auth-form" onSubmit={handleSignup} autoComplete="off">
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" required />
                    </div>

                    {contactMethod === 'email' ? (
                        <div className="form-group">
                            <label>Email Address *</label>
                            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" required />
                        </div>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>Mobile Number *</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="tel" inputMode="numeric" placeholder="Enter 10 digit number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} disabled={otpSent && cooldown > 0} autoComplete="off" required />
                                    <button type="button" onClick={handleSendOtp} disabled={cooldown > 0 || isLoading} style={{ padding: '0 15px', borderRadius: '6px', cursor: cooldown > 0 ? 'not-allowed' : 'pointer', minWidth: '110px' }}>
                                        {cooldown > 0 ? `Resend (${cooldown}s)` : (otpSent ? 'Resend' : 'Get OTP')}
                                    </button>
                                </div>
                            </div>
                            {otpSent && (
                                <div className="form-group">
                                    <label>Enter 4-Digit OTP *</label>
                                    <input type="text" inputMode="numeric" maxLength="4" placeholder="1234" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} autoFocus required />
                                </div>
                            )}
                        </>
                    )}

                    <div className="form-group">
                        <label>Password *</label>
                        <input type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
                        
                        {/* Upgraded Strength Meter */}
                        {password.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ height: '4px', width: '100%', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: '2px', transition: 'all 0.3s', width: strength.width, backgroundColor: strength.color }}></div>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 'bold', display: 'block', marginTop: '4px', textAlign: 'right' }}>
                                    {strength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn-auth-submit" disabled={isLoading || (contactMethod === 'phone' && !otpSent)}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;