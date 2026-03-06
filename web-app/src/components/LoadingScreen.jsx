import React from 'react';

const LoadingScreen = () => {
    return (
        <div style={containerStyle}>
            <div style={loaderStyle}>
                <svg
                    width="60"
                    height="60"
                    viewBox="0 0 50 50"
                    style={svgStyle}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="25" cy="25" r="20" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="4" />
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        stroke="#16a34a" /* Green theme from Sovely logo */
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="125"
                        strokeDashoffset="100"
                        style={{
                            animation: 'spin 1.5s linear infinite',
                            transformOrigin: '50% 50%'
                        }}
                    />
                </svg>
                <h2 style={textStyle}>Loading Sovely...</h2>
            </div>

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.6; }
                    }
                `}
            </style>
        </div>
    );
};

const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    margin: 0,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const loaderStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
};

const svgStyle = {
    filter: 'drop-shadow(0 4px 6px rgba(22, 163, 74, 0.2))'
};

const textStyle = {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: '500',
    color: '#334155',
    letterSpacing: '-0.025em'
};

export default LoadingScreen;
