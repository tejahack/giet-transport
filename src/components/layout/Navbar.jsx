import { useAuth } from '../../contexts/AuthContext';
import { Bus, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="bg-white shadow-md px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
                {/* Logo and Title */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-lg">
                        <Bus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">GIET Transport</h1>
                        <p className="text-xs text-gray-500">Admin Dashboard</p>
                    </div>
                </div>

                {/* User Info and Logout */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                        <User className="w-5 h-5 text-gray-600" />
                        <div className="text-sm">
                            <p className="font-medium text-gray-800">{currentUser?.name || 'Admin'}</p>
                            <p className="text-xs text-gray-500">{currentUser?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
