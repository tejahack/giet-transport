import { useState } from 'react';
import { createDriver } from '../../services/driverService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, User, Mail, Phone, CreditCard, Lock } from 'lucide-react';

const AddDriver = () => {
    const { loginWithEmail } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        licenseNo: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.phone || !formData.licenseNo || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            // Get admin credentials for re-login
            const adminEmail = sessionStorage.getItem('admin_email');
            const adminPassword = sessionStorage.getItem('admin_password');

            const adminCreds = (adminEmail && adminPassword)
                ? { email: adminEmail, password: adminPassword }
                : null;

            // This now automatically creates both Firebase Auth AND Supabase User record
            await createDriver(formData, adminCreds);

            toast.success('Driver account and database record created successfully!');

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                licenseNo: '',
                password: ''
            });
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to create driver');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 max-w-2xl mx-auto p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary-100 rounded-xl">
                    <UserPlus className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">New Driver Registration</h2>
                    <p className="text-slate-500">Add info to both Auth and Database automatically</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Input */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 py-3 pl-12 pr-4 rounded-xl outline-none transition-all text-slate-800"
                                placeholder="e.g. Raju Kumar"
                                required
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 py-3 pl-12 pr-4 rounded-xl outline-none transition-all text-slate-800"
                                placeholder="driver@giet.edu"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 py-3 pl-12 pr-4 rounded-xl outline-none transition-all text-slate-800"
                                placeholder="+91 0000000000"
                                required
                            />
                        </div>
                    </div>

                    {/* License Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">License No</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                name="licenseNo"
                                value={formData.licenseNo}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 py-3 pl-12 pr-4 rounded-xl outline-none transition-all text-slate-800"
                                placeholder="AP01 2024 XXXX"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Initial Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 py-3 pl-12 pr-4 rounded-xl outline-none transition-all text-slate-800"
                                placeholder="Minimum 6 chars"
                                minLength={6}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-lg shadow-primary-100"
                    >
                        {loading ? 'Creating Hybrid Record...' : 'Complete Registration'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddDriver;
