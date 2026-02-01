import { useState } from 'react';
import { createRoute } from '../../services/routeService';
import toast from 'react-hot-toast';
import { MapPin, Plus, X, Route as RouteIcon } from 'lucide-react';

const AddRoute = () => {
    const [routeName, setRouteName] = useState('');
    const [stops, setStops] = useState(['']);
    const [loading, setLoading] = useState(false);

    const handleAddStop = () => {
        setStops([...stops, '']);
    };

    const handleRemoveStop = (index) => {
        const newStops = stops.filter((_, i) => i !== index);
        setStops(newStops.length > 0 ? newStops : ['']);
    };

    const handleStopChange = (index, value) => {
        const newStops = [...stops];
        newStops[index] = value;
        setStops(newStops);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!routeName.trim()) {
            toast.error('Please enter a route name');
            return;
        }

        const validStops = stops.filter(stop => stop.trim() !== '');
        if (validStops.length === 0) {
            toast.error('Please add at least one stop');
            return;
        }

        setLoading(true);
        try {
            await createRoute({ routeName, stops: validStops });
            toast.success('Route created successfully!');

            // Reset form
            setRouteName('');
            setStops(['']);
        } catch (error) {
            toast.error('Failed to create route');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-lg">
                    <RouteIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Create New Route</h2>
                    <p className="text-gray-600">Define a route with multiple stops</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Route Name */}
                <div>
                    <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 mb-2">
                        Route Name *
                    </label>
                    <input
                        id="routeName"
                        type="text"
                        value={routeName}
                        onChange={(e) => setRouteName(e.target.value)}
                        className="input-field"
                        placeholder="e.g., Route 5 - Kakinada"
                        required
                    />
                </div>

                {/* Stops */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Stops *
                    </label>

                    <div className="space-y-3">
                        {stops.map((stop, index) => (
                            <div key={index} className="flex gap-2">
                                <div className="flex-1 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={stop}
                                        onChange={(e) => handleStopChange(index, e.target.value)}
                                        className="input-field"
                                        placeholder={`Stop ${index + 1}`}
                                    />
                                </div>
                                {stops.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveStop(index)}
                                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleAddStop}
                        className="mt-3 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Another Stop
                    </button>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Route...' : 'Create Route'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddRoute;
