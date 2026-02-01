import { useState, useEffect } from 'react';
import { sendAlert } from '../../services/alertService';
import { getRoutes } from '../../services/routeService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Bell, MessageSquare, Route as RouteIcon } from 'lucide-react';

const SendAlert = () => {
    const { currentUser } = useAuth();
    const [routes, setRoutes] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        targetRoute: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const routesList = await getRoutes();
            setRoutes(routesList);
        } catch (error) {
            console.error('Failed to fetch routes:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.message || !formData.targetRoute) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await sendAlert({
                ...formData,
                adminUid: currentUser?.uid || 'admin'
            });

            toast.success('Alert sent successfully!');

            // Reset form
            setFormData({
                title: '',
                message: '',
                targetRoute: ''
            });
        } catch (error) {
            toast.error('Failed to send alert');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="flex items-center gap-3">
                    <Bell className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Send Alert</h2>
                        <p className="opacity-90">Broadcast messages to students</p>
                    </div>
                </div>
            </div>

            {/* Alert Form */}
            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Title Input */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Alert Title *
                        </label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., Bus Delay Notice"
                            required
                        />
                    </div>

                    {/* Message Input */}
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                            Message *
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="4"
                                className="input-field pl-10 resize-none"
                                placeholder="Enter your message here..."
                                required
                            />
                        </div>
                    </div>

                    {/* Target Route Selection */}
                    <div>
                        <label htmlFor="targetRoute" className="block text-sm font-medium text-gray-700 mb-2">
                            Target Route *
                        </label>
                        <div className="relative">
                            <RouteIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                id="targetRoute"
                                name="targetRoute"
                                value={formData.targetRoute}
                                onChange={handleChange}
                                className="input-field pl-10"
                                required
                            >
                                <option value="">Select a route</option>
                                <option value="all">All Routes</option>
                                {routes.map((route) => (
                                    <option key={route.id} value={route.id}>
                                        {route.route_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Bell className="w-5 h-5" />
                        {loading ? 'Sending Alert...' : 'Send Alert to Students'}
                    </button>
                </form>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>ℹ️ How it works:</strong> This alert will be saved to Supabase's <code className="bg-white px-2 py-1 rounded">alerts</code> table.
                        Student apps listening to this table will receive and display the notification.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SendAlert;
