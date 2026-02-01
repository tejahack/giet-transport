import { useState, useEffect, useRef } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { supabase } from '../../config/supabase';
import { Bus, Navigation, Gauge, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY || 'YOUR_TOMTOM_API_KEY_HERE';

const LiveMap = () => {
    const mapElement = useRef(null);
    const [map, setMap] = useState(null);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const markers = useRef({});

    // Initialize Map
    useEffect(() => {
        if (!API_KEY || API_KEY === 'YOUR_TOMTOM_API_KEY_HERE') {
            toast.error("TomTom API Key missing! Add it to your .env file.");
        }

        const ttMap = tt.map({
            key: API_KEY,
            container: mapElement.current,
            center: [82.2355, 16.9744], // Default to GIET area
            zoom: 13,
            stylesVisibility: {
                trafficIncidents: true,
                trafficFlow: true
            }
        });

        ttMap.addControl(new tt.NavigationControl());
        ttMap.addControl(new tt.FullscreenControl());

        setMap(ttMap);

        return () => ttMap.remove();
    }, []);

    // Fetch initial data and subscribe to Supabase Realtime
    useEffect(() => {
        // Initial fetch
        const fetchLocations = async () => {
            const { data, error } = await supabase
                .from('live_locations')
                .select('*');

            if (error) {
                console.error('Error fetching locations:', error);
            } else {
                setBuses(data || []);
            }
            setLoading(false);
        };

        fetchLocations();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('live_locations_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'live_locations'
                },
                (payload) => {
                    console.log('Realtime update:', payload);

                    if (payload.eventType === 'INSERT') {
                        setBuses(prev => [...prev, payload.new]);
                    } else if (payload.eventType === 'UPDATE') {
                        setBuses(prev => prev.map(bus =>
                            bus.id === payload.new.id ? payload.new : bus
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setBuses(prev => prev.filter(bus => bus.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Update Markers
    useEffect(() => {
        if (!map) return;

        const busIds = buses.map(b => b.id);

        // Remove old markers
        Object.keys(markers.current).forEach(id => {
            if (!busIds.includes(id)) {
                markers.current[id].remove();
                delete markers.current[id];
            }
        });

        // Add or update markers
        buses.forEach(bus => {
            const lngLat = [bus.lng, bus.lat];

            if (markers.current[bus.id]) {
                markers.current[bus.id].setLngLat(lngLat);
            } else {
                const element = document.createElement('div');
                element.innerHTML = `
                    <div style="
                        background-color: #0ea5e9;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 10px rgba(14, 165, 233, 0.4);
                        border: 3px solid white;
                        cursor: pointer;
                    ">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                            <rect x="3" y="6" width="18" height="13" rx="2"/>
                            <path d="M3 12h18"/>
                            <circle cx="8" cy="16" r="1.5"/>
                            <circle cx="16" cy="16" r="1.5"/>
                        </svg>
                    </div>
                `;

                const popup = new tt.Popup({ offset: 35 }).setHTML(`
                    <div style="padding: 10px; font-family: sans-serif;">
                        <div style="font-weight: 900; color: #0f172a; margin-bottom: 5px;">
                            🚌 Bus ${bus.id}
                        </div>
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
                            ${bus.driver_name || 'Unknown Driver'}
                        </div>
                        <div style="background: #f1f5f9; padding: 5px 8px; border-radius: 8px; font-weight: bold; color: #0284c7;">
                            Speed: ${bus.speed || 0} km/h
                        </div>
                    </div>
                `);

                const marker = new tt.Marker({ element })
                    .setLngLat(lngLat)
                    .setPopup(popup)
                    .addTo(map);

                markers.current[bus.id] = marker;
            }
        });
    }, [buses, map]);

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-100 rounded-2xl">
                            <Bus className="w-8 h-8 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Active Buses</p>
                            <p className="text-3xl font-black text-slate-800">{buses.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-2xl">
                            <Navigation className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Engine</p>
                            <p className="text-xl font-black text-slate-800">Supabase Realtime</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-2xl">
                            <Gauge className="w-8 h-8 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Map Provider</p>
                            <p className="text-xl font-black text-slate-800">TomTom Maps</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="bg-white rounded-[2.5rem] p-3 shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden h-[calc(100vh-280px)]">
                {buses.length === 0 && !loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm m-3 rounded-[2.2rem]">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                                <MapPin className="w-10 h-10 text-slate-300 animate-bounce" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Waiting for Signals</h3>
                            <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">
                                Add records to the <code className="bg-slate-200 px-2 py-0.5 rounded">live_locations</code> table in Supabase.
                            </p>
                        </div>
                    </div>
                )}

                <div ref={mapElement} className="w-full h-full rounded-[2.2rem]" />
            </div>
        </div>
    );
};

export default LiveMap;
