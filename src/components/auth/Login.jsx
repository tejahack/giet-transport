import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bus, Lock, Mail, GraduationCap } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loginWithEmail, loading, userRole, currentUser } = useAuth();
    const navigate = useNavigate();

    // 1. Automatic redirection if already logged in
    useEffect(() => {
        // If auth is NOT loading and we have a valid role, move to dashboard
        if (!loading && currentUser && (userRole === 'admin' || userRole === 'faculty')) {
            navigate('/dashboard');
        }
    }, [userRole, currentUser, loading, navigate]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        try {
            await loginWithEmail(email, password);
            // Redirection is handled by the useEffect above
        } catch (error) {
            // Error toast is handled inside loginWithEmail
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 border border-white/10 relative z-10 animate-in fade-in zoom-in duration-500">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl mb-6 shadow-2xl shadow-primary-900/50 rotate-3">
                        <Bus className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">GIET Transport</h1>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="h-px w-8 bg-white/20"></span>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Management Portal</p>
                        <span className="h-px w-8 bg-white/20"></span>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-6">

                    {/* Email Field */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                            Identification
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 text-white font-medium transition-all placeholder:text-slate-600"
                                placeholder="name@giet.edu"
                                required
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                            Security Key
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 text-white font-medium transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-900/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-95 group overflow-hidden relative"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Accessing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Authenticate</span>
                                    <Bus className="w-5 h-5 opacity-50 group-hover:translate-x-1 duration-300" />
                                </>
                            )}
                        </span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                    </button>
                </form>

                {/* Role Info */}
                <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl">
                        <Bus className="w-4 h-4 text-primary-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Admin Access</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl">
                        <GraduationCap className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Faculty Access</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
