import { useState, useEffect } from 'react';
import { getDrivers, deleteDriver } from '../../services/driverService';
import toast from 'react-hot-toast';
import { Trash2, Phone, Mail, CreditCard, AlertCircle } from 'lucide-react';

const DriverList = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);

    // Fetch drivers on component mount
    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const driversList = await getDrivers();
            setDrivers(driversList);
        } catch (error) {
            toast.error('Failed to fetch drivers');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (uid, name) => {
        if (!window.confirm(`Are you sure you want to delete driver "${name}"?`)) {
            return;
        }

        setDeleteLoading(uid);
        try {
            await deleteDriver(uid);
            toast.success('Driver deleted successfully');
            // Remove from local state
            setDrivers(prev => prev.filter(driver => driver.id !== uid));
        } catch (error) {
            toast.error('Failed to delete driver');
            console.error(error);
        } finally {
            setDeleteLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading drivers...</p>
                </div>
            </div>
        );
    }

    if (drivers.length === 0) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No drivers registered yet</p>
                    <p className="text-gray-500 mt-2">Add your first driver using the form above</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
                Registered Drivers ({drivers.length})
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">License No</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {drivers.map((driver) => (
                            <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                            <span className="text-primary-700 font-semibold">
                                                {driver.name ? driver.name.charAt(0).toUpperCase() : 'D'}
                                            </span>
                                        </div>
                                        <span className="font-medium text-gray-900">{driver.name || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">{driver.email}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">{driver.phone}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <CreditCard className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-mono">{driver.license_no}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <button
                                        onClick={() => handleDelete(driver.id, driver.name)}
                                        disabled={deleteLoading === driver.id}
                                        className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {deleteLoading === driver.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DriverList;
