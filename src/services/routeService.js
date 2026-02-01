import { supabase } from '../config/supabase';

/**
 * Create a new route in Supabase
 */
export const createRoute = async (routeData) => {
    try {
        const { routeName, stops } = routeData;

        const { data, error } = await supabase
            .from('routes')
            .insert([
                {
                    route_name: routeName,
                    stops: stops
                }
            ])
            .select();

        if (error) throw error;
        return { success: true, id: data[0].id };
    } catch (error) {
        console.error('Error creating route:', error);
        throw error;
    }
};

/**
 * Get all routes from Supabase
 */
export const getRoutes = async () => {
    try {
        const { data, error } = await supabase
            .from('routes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching routes:', error);
        throw error;
    }
};

/**
 * Update a route in Supabase
 */
export const updateRoute = async (routeId, routeData) => {
    try {
        const { error } = await supabase
            .from('routes')
            .update({
                route_name: routeData.routeName,
                stops: routeData.stops
            })
            .eq('id', routeId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error updating route:', error);
        throw error;
    }
};

/**
 * Delete a route from Supabase
 */
export const deleteRoute = async (routeId) => {
    try {
        const { error } = await supabase
            .from('routes')
            .delete()
            .eq('id', routeId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting route:', error);
        throw error;
    }
};
