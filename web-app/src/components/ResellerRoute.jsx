import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import LoadingScreen from './LoadingScreen';

const ResellerRoute = () => {
    const location = useLocation();
    const { user, loading } = useContext(AuthContext);

    if (loading) return <LoadingScreen />;

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Optional: Add role-based protection if this is strictly for verified resellers/admins
    // if (user.role !== 'RESELLER' && user.role !== 'ADMIN') {
    //     return <Navigate to="/" replace />;
    // }

    // CRITICAL FIX: Return <Outlet /> instead of children or nothing
    return <Outlet />;
};

export default ResellerRoute;
