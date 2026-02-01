import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Map, Route, Bell } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/drivers', icon: UserCog, label: 'Drivers' },
        { path: '/students', icon: Users, label: 'Students' },
        { path: '/routes', icon: Route, label: 'Routes' },
        { path: '/live-map', icon: Map, label: 'Live Map' },
        { path: '/alerts', icon: Bell, label: 'Send Alert' },
    ];

    return (
        <aside className="w-64 bg-white shadow-md min-h-screen sticky top-16">
            <nav className="p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
