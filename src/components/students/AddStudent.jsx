import { useState } from 'react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';
import { UserPlus, User, Mail, Hash, Loader2, Sparkles, ShieldCheck, Building2, BookOpen } from 'lucide-react';

/**
 * AddStudent Component - With Block and Branch fields
 */
const AddStudent = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rollNumber: '',
        branch: '',
        block: ''
    });
    const [loading, setLoading] = useState(false);

    // Branch options
    const branches = [
        'CSE - Computer Science Engineering',
        'AI - Artificial Intelligence',
        'ECE - Electronics & Communication',
        'EEE - Electrical & Electronics',
        'MECH - Mechanical Engineering',
        'CIVIL - Civil Engineering',
        'IT - Information Technology',
        'AIDS - AI & Data Science',
        'AIML - AI & Machine Learning',
        'CSM - Computer Science (AI/ML)',
        'CSD - Computer Science (Data Science)'
    ];

    // Block options
    const blocks = [
        'BTECH BLOCK',
        'DEGREE BLOCK',
        'DIPLOMA BLOCK',
        'PHARMACY BLOCK',
        'MTECH BLOCK',
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.rollNumber || !formData.branch || !formData.block) {
            toast.error('All fields are required');
            return;
        }

        setLoading(true);

        try {
            const DEFAULT_PASSWORD = "gietstudent";

            // Get admin/faculty credentials for re-login
            const adminEmail = sessionStorage.getItem('admin_email');
            const adminPassword = sessionStorage.getItem('admin_password');

            // 1. Create Supabase Auth account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: DEFAULT_PASSWORD,
                options: {
                    data: {
                        name: formData.name,
                        role: 'student'
                    }
                }
            });

            if (authError) throw authError;

            const userId = authData.user?.id;
            if (!userId) throw new Error('Failed to create auth account');

            // 2. Save to Supabase database with block and branch
            const { error: dbError } = await supabase
                .from('users')
                .insert([
                    {
                        id: userId,
                        email: formData.email,
                        role: 'student',
                        name: formData.name,
                        roll_number: formData.rollNumber,
                        branch: formData.branch,
                        block: formData.block,
                        is_blocked: false
                    }
                ]);

            if (dbError) throw new Error(`Database Sync Failed: ${dbError.message}`);

            // 3. Sign out the new student and re-authenticate admin/faculty
            await supabase.auth.signOut();

            if (adminEmail && adminPassword) {
                await supabase.auth.signInWithPassword({
                    email: adminEmail,
                    password: adminPassword
                });
            }

            toast.success(`${formData.name} registered successfully!`, {
                duration: 5000,
                icon: '🎓'
            });

            setFormData({ name: '', email: '', rollNumber: '', branch: '', block: '' });

        } catch (error) {
            console.error('Registration Error:', error);
            setLoading(false); // Reset immediately in catch

            let errorMsg = error.message;
            if (error.message?.includes('already registered')) {
                errorMsg = "Account already exists! Please check the Students list to ensure their record is complete.";
            }

            toast.error(errorMsg, { duration: 4000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-200">
                        <UserPlus className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Student Registration</h1>
                        <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-[0.2em] flex items-center justify-center md:justify-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Faculty Portal
                        </p>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                                    <User className="w-4 h-4" /> Student Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white p-4 rounded-2xl outline-none transition-all text-slate-800 font-bold placeholder:font-normal"
                                    placeholder="Enter full name"
                                    autoComplete="off"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Roll Number */}
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                                        <Hash className="w-4 h-4" /> Roll Number
                                    </label>
                                    <input
                                        type="text"
                                        name="rollNumber"
                                        value={formData.rollNumber}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white p-4 rounded-2xl outline-none transition-all text-slate-800 font-bold placeholder:font-normal uppercase"
                                        placeholder="e.g. 21BE...XXXX"
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Email */}
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                                        <Mail className="w-4 h-4" /> Institutional Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white p-4 rounded-2xl outline-none transition-all text-slate-800 font-bold placeholder:font-normal"
                                        placeholder="student@giet.edu"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Branch */}
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                                        <BookOpen className="w-4 h-4" /> Branch / Department
                                    </label>
                                    <select
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white p-4 rounded-2xl outline-none transition-all text-slate-800 font-bold"
                                    >
                                        <option value="">Select Branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch} value={branch}>{branch}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Block */}
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                                        <Building2 className="w-4 h-4" /> Block / Hostel
                                    </label>
                                    <select
                                        name="block"
                                        value={formData.block}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white p-4 rounded-2xl outline-none transition-all text-slate-800 font-bold"
                                    >
                                        <option value="">Select Block</option>
                                        {blocks.map((block) => (
                                            <option key={block} value={block}>{block}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6 text-amber-300" />
                                    <span>Register Student</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Info Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden h-full">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5" /> Registration Info
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <div className="shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black text-xs">01</div>
                                    <p className="text-sm font-medium opacity-90 leading-relaxed">
                                        Account created in <span className="underline">Supabase Auth</span>
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black text-xs">02</div>
                                    <p className="text-sm font-medium opacity-90 leading-relaxed">
                                        Default password: <span className="bg-white/20 px-2 py-0.5 rounded font-black">gietstudent</span>
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black text-xs">03</div>
                                    <p className="text-sm font-medium opacity-90 leading-relaxed">
                                        Block & Branch saved to database
                                    </p>
                                </li>
                            </ul>
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Faculty Portal</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudent;
