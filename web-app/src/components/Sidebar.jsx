import React, { useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        await logout();
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        onClose();
        navigate('/login');
    };

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src="https://m.media-amazon.com/images/X/bxt1/M/Bbxt1BI1cNpD5ln._SL160_QL95_FMwebp_.png" alt="Sovely Logo" className="logo-image" />
                        <span className="logo-text">Sovely</span>
                    </div>
                    <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
                        ✕
                    </button>
                </div>

                <div className="sidebar-content">
                    <div className="sidebar-section">
                        <h3 className="sidebar-heading">Main Menu</h3>
                        <ul className="sidebar-nav">
                            <li>
                                <a href="#" className="sidebar-link active">
                                    <span className="sidebar-icon">🏠</span>
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#" className="sidebar-link">
                                    <span className="sidebar-icon">📦</span>
                                    Manage NDR
                                </a>
                            </li>
                            <li>
                                <a href="#" className="sidebar-link">
                                    <span className="sidebar-icon">🛍️</span>
                                    Cart
                                </a>
                            </li>
                            <li>
                                <a href="#" className="sidebar-link">
                                    <span className="sidebar-icon">🚚</span>
                                    Order Track
                                </a>
                            </li>
                            <li>
                                <a href="#" className="sidebar-link">
                                    <span className="sidebar-icon">📋</span>
                                    Inventory
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="sidebar-section">
                        <h3 className="sidebar-heading">Discover</h3>
                        <ul className="sidebar-nav">
                            <li>
                                <a href="#deals" className="sidebar-link" onClick={onClose}>
                                    <span className="sidebar-icon">🔥</span>
                                    Today's Deals
                                </a>
                            </li>
                            <li>
                                <a href="#categories" className="sidebar-link" onClick={onClose}>
                                    <span className="sidebar-icon">🏷️</span>
                                    All Categories
                                </a>
                            </li>
                            <li>
                                <a href="#services" className="sidebar-link" onClick={onClose}>
                                    <span className="sidebar-icon">🛡️</span>
                                    Our Services
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="sidebar-section">
                        <h3 className="sidebar-heading">Settings</h3>
                        <ul className="sidebar-nav">
                            <li>
                                <Link to="/my-account" className="sidebar-link" onClick={onClose}>
                                    <span className="sidebar-icon">👤</span>
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="sidebar-link">
                                    <span className="sidebar-icon">⚙️</span>
                                    Preferences
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Auth CTA / Logout at the bottom */}
                <div className="sidebar-footer">
                    {user ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '16px', textAlign: 'center' }}>
                                {/* User Avatar */}
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    backgroundColor: '#e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    marginBottom: '4px',
                                    border: '2px solid #ffffff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}>
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '1.5rem', color: '#64748b', fontWeight: '600' }}>
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    )}
                                </div>

                                <p className="sidebar-auth-label" style={{ margin: 0, color: '#0f172a' }}>
                                    Logged in as <b style={{ fontWeight: '600' }}>{user.name || "User"}</b>
                                </p>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, wordBreak: 'break-all' }}>
                                    {user.email}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#fee2e2',
                                    color: '#b91c1c',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    fontSize: '0.95rem'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#fecaca'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="sidebar-auth-label" style={{ textAlign: 'center', width: '100%', display: 'block' }}>Ready to start selling?</p>
                            <div className="sidebar-auth-btns">
                                <Link to="/login" className="btn-sidebar-login" onClick={onClose}>Log In</Link>
                                <Link to="/signup" className="btn-sidebar-signup" onClick={onClose}>Sign Up Free</Link>
                            </div>
                        </>
                    )}
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
