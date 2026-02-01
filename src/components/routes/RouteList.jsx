import { useState, useEffect } from 'react';
import { getRoutes, deleteRoute } from '../../services/routeService';
import toast from 'react-hot-toast';
import { Route as RouteIcon, MapPin, Trash2, AlertCircle } from 'lucide-react';

const RouteList = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [expandedRoute, setExpandedRoute] = useState(null);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const routesList = await getRoutes();
            setRoutes(routesList);
        } catch (error) {
            toast.error('Failed to fetch routes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (routeId, routeName) => {
        if (!window.confirm(`Are you sure you want to delete "${routeName}"?`)) {
            return;
        }

        setDeleteLoading(routeId);
        try {
            await deleteRoute(routeId);
            toast.success('Route deleted successfully');
            setRoutes(prev => prev.filter(route => route.id !== routeId));
        } catch (error) {
            toast.error('Failed to delete route');
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
                    <p className="text-gray-600 mt-4">Loading routes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
                All Routes ({routes.length})
            </h3>

            {routes.length === 0 ? (
                <div className="text-center py-8">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No routes created yet</p>
                    <p className="text-gray-500 mt-2">Create your first route using the form above</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {routes.map((route) => (
                        <div
                            key={route.id}
                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Route Header */}
                            <div className="bg-gray-50 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="p-2 bg-primary-500 rounded-lg">
                                        <RouteIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800">{route.route_name}</h4>
                                        <p className="text-sm text-gray-600">{route.stops?.length || 0} stops</p>
                                    </div>
                                    <button
                                        onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
                                        className="px-3 py-1 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-md text-sm font-medium transition-colors"
                                    >
                                        {expandedRoute === route.id ? 'Hide Stops' : 'View Stops'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(route.id, route.route_name)}
                                        disabled={deleteLoading === route.id}
                                        className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {deleteLoading === route.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>

                            {/* Stops List (Expandable) */}
                            {expandedRoute === route.id && (
                                <div className="p-4 bg-white">
                                    <div className="space-y-2">
                                        {route.stops?.map((stop, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center justify-center w-8 h-8 bg-primary-500 text-white rounded-full font-semibold text-sm">
                                                    {index + 1}
                                                </div>
                                                <MapPin className="w-5 h-5 text-gray-400" />
                                                <span className="text-gray-800">{stop}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RouteList;
