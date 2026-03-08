import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Auth.css';

const Login = () => {
    const [loginMethod, setLoginMethod] = useState('email'); 
    
    // Email State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Mobile State
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
        if (!phoneNumber || phoneNumber.length < 10) return setError("Please enter a valid phone number");
        setError('');
        setIsLoading(true);
        const res = await sendOtp(phoneNumber, true); // true = Login OTP
        setIsLoading(false);
        
        if (res.success) {
            setOtpSent(true);
            setCooldown(30);
        } else {
            setError(res.message);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await login(email, password);
            if (response.success) navigate('/');
            else throw new Error(response.message || "Invalid credentials");
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
            else throw new Error(response.message || "Invalid OTP");
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
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button type="button" onClick={() => { setLoginMethod('email'); setError(''); }} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px', background: loginMethod === 'email' ? '#000' : '#fff', color: loginMethod === 'email' ? '#fff' : '#000', cursor: 'pointer' }}>Email</button>
                    <button type="button" onClick={() => { setLoginMethod('phone'); setError(''); }} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px', background: loginMethod === 'phone' ? '#000' : '#fff', color: loginMethod === 'phone' ? '#fff' : '#000', cursor: 'pointer' }}>Mobile Number</button>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                {/* EMAIL LOGIN FORM */}
                {loginMethod === 'email' && (
                    <form className="auth-form" onSubmit={handleEmailLogin} autoComplete="off">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
                        </div>
                        <div className="auth-options">
                            <label className="checkbox-label"><input type="checkbox" /> Remember me</label>
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>
                        <button type="submit" className="btn-auth-submit" disabled={isLoading}>{isLoading ? 'Signing In...' : 'Sign In'}</button>
                    </form>
                )}

                {/* MOBILE OTP LOGIN FORM */}
                {loginMethod === 'phone' && (
                    <form className="auth-form" onSubmit={otpSent ? handleOtpLogin : (e) => { e.preventDefault(); handleSendOtp(); }} autoComplete="off">
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <input type="tel" inputMode="numeric" placeholder="Enter 10 digit number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} disabled={otpSent && cooldown > 0} autoComplete="off" required />
                        </div>
                        
                        {otpSent && (
                            <div className="form-group">
                                <label>Enter 4-Digit OTP</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="text" inputMode="numeric" maxLength="4" placeholder="1234" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} autoFocus required />
                                    <button type="button" onClick={handleSendOtp} disabled={cooldown > 0 || isLoading} style={{ padding: '0 15px', borderRadius: '6px', cursor: cooldown > 0 ? 'not-allowed' : 'pointer', minWidth: '110px' }}>
                                        {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {!otpSent ? (
                            <button type="submit" className="btn-auth-submit" style={{ background: '#333' }} disabled={isLoading}>{isLoading ? 'Sending...' : 'Get OTP'}</button>
                        ) : (
                            <button type="submit" className="btn-auth-submit" disabled={isLoading || otpCode.length < 4}>{isLoading ? 'Verifying...' : 'Verify & Login'}</button>
                        )}
                    </form>
                )}

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;