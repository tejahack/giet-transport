import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading, userRole } = useAuth();

    // 1. Wait for auth to initialize (crucial for refresh)
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-400 font-bold">Resuming Session...</p>
                </div>
            </div>
        );
    }

    // 2. If not logged in at all, redirect to login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // 3. User must be either admin or faculty
    const ALLOWED_ROLES = ['admin', 'faculty'];
    if (!ALLOWED_ROLES.includes(userRole)) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
