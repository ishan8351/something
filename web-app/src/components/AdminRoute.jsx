// web-app/src/components/AdminRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import LoadingScreen from './LoadingScreen';

const AdminRoute = ({ children }) => {
    // We can use the clean isAdmin flag we built into the context!
    const { isAdmin, loading, user } = useContext(AuthContext);

    if (loading) return <LoadingScreen />;

    // If they aren't logged in, or aren't an admin, kick them out
    if (!user || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
