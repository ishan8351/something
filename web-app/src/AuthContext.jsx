import React, { createContext, useState, useEffect } from 'react';
import api from './utils/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
            localStorage.removeItem('reseller_cart');

            // THE FIX: Only redirect if they aren't already on the login or signup page!
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/signup') {
                window.location.href = '/login?session_expired=true';
            }
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);

        const fetchUser = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data?.data) setUser(response.data.data);
            } catch (error) {
                // If it fails, they are a guest. Just set user to null.
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            setUser(response.data.data.user);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data?.data?.user) {
                setUser(response.data.data.user);
            }
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
        } catch (error) {
            console.error('Error logging out', error);
            // Even if the server fails, clear local state
            setUser(null);
        }
    };

    const sendOtp = async (phoneNumber, isLogin = false) => {
        try {
            const response = await api.post('/auth/send-otp', { phoneNumber, isLogin });
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send OTP',
            };
        }
    };

    const loginWithOtpReq = async (phoneNumber, otpCode) => {
        try {
            const response = await api.post('/auth/login-otp', { phoneNumber, otpCode });
            setUser(response.data.data.user);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Invalid OTP' };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                loading,
                sendOtp,
                loginWithOtpReq,
                isKycApproved: user?.kycStatus === 'APPROVED',
                isAdmin: user?.role === 'ADMIN', // Very helpful for frontend routing!
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
