import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import LoadingScreen from './LoadingScreen';

const ResellerRoute = ({ children }) => {
    const { user, loading, isKycApproved } = useContext(AuthContext);

    if (loading) return <LoadingScreen />;

    // Must be logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Must be a B2B user with approved KYC
    if (user.accountType === 'B2B' && !isKycApproved) {
        // Redirect them to a KYC pending page or dashboard
        return <Navigate to="/kyc-pending" replace />;
    }

    return children;
};

export default ResellerRoute;
