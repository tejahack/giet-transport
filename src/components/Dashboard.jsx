import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Users, UserCog, Route, Bus, MapPin, Bell, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalDrivers: 0,
        totalStudents: 0,
        activeRoutes: 0,
        onlineBuses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();

        // Subscribe to live_locations for real-time bus count
        const channel = supabase
            .channel('dashboard_bus_count')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'live_locations'
                },
                async () => {
                    // Refetch bus count on any change
                    const { count } = await supabase
                        .from('live_locations')
                        .select('*', { count: 'exact', head: true });

                    setStats(prev => ({ ...prev, onlineBuses: count || 0 }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch all counts from Supabase
            const [drivers, students, routes, buses] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
                supabase.from('routes').select('*', { count: 'exact', head: true }),
                supabase.from('live_locations').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                totalDrivers: drivers.count || 0,
                totalStudents: students.count || 0,
                activeRoutes: routes.count || 0,
                onlineBuses: buses.count || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const dashboardCards = [
        {
            title: 'Total Drivers',
            value: stats.totalDrivers,
            icon: UserCog,
            color: 'from-blue-600 to-blue-700',
            link: '/drivers'
        },
        {
            title: 'Total Students',
            value: stats.totalStudents,
            icon: Users,
            color: 'from-emerald-600 to-emerald-700',
            link: '/students'
        },
        {
            title: 'Active Routes',
            value: stats.activeRoutes,
            icon: Route,
            color: 'from-indigo-600 to-indigo-700',
            link: '/routes'
        },
        {
            title: 'Online Buses',
            value: stats.onlineBuses,
            icon: Bus,
            color: 'from-amber-600 to-amber-700',
            link: '/live-map'
        }
    ];

    const quickActions = [
        { title: 'Add Driver', icon: UserCog, link: '/drivers', color: 'bg-blue-600' },
        { title: 'Add Student', icon: UserPlus, link: '/add-student', color: 'bg-emerald-600' },
        { title: 'Manage Routes', icon: Route, link: '/routes', color: 'bg-indigo-600' },
        { title: 'Live Tracking', icon: MapPin, link: '/live-map', color: 'bg-amber-600' },
        { title: 'Mass Alert', icon: Bell, link: '/alerts', color: 'bg-rose-600' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-slate-500 mt-4 font-bold">Initializing Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((card, index) => (
                    <Link key={index} to={card.link}>
                        <div className={`p-6 rounded-3xl bg-gradient-to-br ${card.color} text-white hover:scale-[1.02] transition-all cursor-pointer shadow-xl shadow-slate-200`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">{card.title}</p>
                                    <p className="text-4xl font-black">{card.value}</p>
                                </div>
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <card.icon className="w-8 h-8" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-8">
                <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary-600 rounded-full"></span>
                    Quick Control Center
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {quickActions.map((action, index) => (
                        <Link key={index} to={action.link}>
                            <div className="group p-6 bg-slate-50 rounded-3xl hover:bg-white hover:shadow-2xl hover:shadow-primary-100 border-2 border-transparent hover:border-primary-100 transition-all cursor-pointer text-center">
                                <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                                    <action.icon className="w-7 h-7 text-white" />
                                </div>
                                <p className="font-bold text-slate-800 text-sm">{action.title}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-8">
                    <h3 className="text-lg font-black text-slate-800 mb-6">Service Health</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <span className="font-bold text-slate-600 text-sm">Supabase Database</span>
                            <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Connected
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <span className="font-bold text-slate-600 text-sm">Supabase Auth</span>
                            <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Secure
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <span className="font-bold text-slate-600 text-sm">Supabase Realtime</span>
                            <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Live
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-black mb-4">100% Supabase</h3>
                        <p className="text-sm opacity-90 leading-relaxed mb-6 font-medium">
                            This portal is now fully powered by Supabase - no Firebase dependencies.
                        </p>
                        <ul className="space-y-3 text-sm font-bold">
                            <li className="flex items-center gap-3">
                                <div className="p-1 bg-white/20 rounded-lg"><Users className="w-4 h-4" /></div>
                                PostgreSQL Database
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1 bg-white/20 rounded-lg"><UserCog className="w-4 h-4" /></div>
                                Supabase Authentication
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1 bg-white/20 rounded-lg"><MapPin className="w-4 h-4" /></div>
                                Realtime GPS Tracking
                            </li>
                        </ul>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
