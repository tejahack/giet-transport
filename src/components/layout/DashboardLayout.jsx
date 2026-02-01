import { useAuth } from '../../contexts/AuthContext';
import { NavLink, Outlet } from 'react-router-dom';
import {
    Bus,
    LayoutDashboard,
    UserCog,
    Map as MapIcon,
    LogOut,
    User,
    Users,
    UserPlus,
    Route,
    Bell,
    GraduationCap
} from 'lucide-react';

const Sidebar = () => {
    const { logout, userRole, isAdmin } = useAuth();

    // All menu items with role-based access
    const allNavItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'faculty'] },
        { name: 'Live Tracking', path: '/live-map', icon: MapIcon, roles: ['admin'] },
        { name: 'Manage Drivers', path: '/drivers', icon: UserCog, roles: ['admin'] },
        { name: 'Manage Students', path: '/students', icon: Users, roles: ['admin', 'faculty'] },
        { name: 'Add Student', path: '/add-student', icon: UserPlus, roles: ['admin', 'faculty'] },
        { name: 'Bus Routes', path: '/routes', icon: Route, roles: ['admin'] },
        { name: 'Send Alert', path: '/alerts', icon: Bell, roles: ['admin'] },
    ];

    // Filter items based on current user's role
    const navItems = allNavItems.filter(item => item.roles.includes(userRole));

    return (
        <aside className="w-72 bg-slate-900 h-screen flex flex-col fixed left-0 top-0 text-slate-400">
            <div className="p-8 flex items-center gap-3">
                <div className={`${isAdmin() ? 'bg-primary-600' : 'bg-emerald-600'} p-2 rounded-xl`}>
                    {isAdmin() ? <Bus className="text-white w-6 h-6" /> : <GraduationCap className="text-white w-6 h-6" />}
                </div>
                <span className="text-xl font-bold text-white tracking-tight leading-none">
                    GIET<br />
                    <span className={`text-xs ${isAdmin() ? 'text-primary-400' : 'text-emerald-400'} font-medium uppercase`}>
                        {isAdmin() ? 'ADMIN PORTAL' : 'FACULTY PORTAL'}
                    </span>
                </span>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-6 py-3.5 rounded-2xl font-bold transition-all duration-200 group ${isActive
                                ? `${isAdmin() ? 'bg-primary-600' : 'bg-emerald-600'} text-white shadow-xl ${isAdmin() ? 'shadow-primary-900/40' : 'shadow-emerald-900/40'} translate-x-1`
                                : 'hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

const DashboardLayout = () => {
    const { currentUser, userRole, isAdmin } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <div className="pl-72">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40">
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                        {isAdmin() ? 'System Management' : 'Student Registration'}
                    </h2>

                    <div className="flex items-center gap-4 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 pr-4">
                        <div className={`w-10 h-10 rounded-xl ${isAdmin() ? 'bg-primary-600' : 'bg-emerald-600'} flex items-center justify-center text-white`}>
                            <User className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800 leading-none">
                                {currentUser?.displayName || (isAdmin() ? 'Administrator' : 'Faculty')}
                            </span>
                            <span className={`text-[10px] font-bold ${isAdmin() ? 'text-primary-600' : 'text-emerald-600'} uppercase tracking-widest mt-1`}>
                                {userRole}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="p-10 max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
