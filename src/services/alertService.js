import { supabase } from '../config/supabase';

/**
 * Send an alert to students using Supabase
 */
export const sendAlert = async (alertData) => {
    try {
        const { title, message, targetRoute, adminUid } = alertData;

        const { data, error } = await supabase
            .from('alerts')
            .insert([
                {
                    title,
                    message,
                    target_route: targetRoute,
                    sent_by: adminUid
                }
            ])
            .select();

        if (error) throw error;
        return { success: true, id: data[0].id };
    } catch (error) {
        console.error('Error sending alert:', error);
        throw error;
    }
};

/**
 * Get all alerts from Supabase (for history view)
 */
export const getAlerts = async () => {
    try {
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching alerts:', error);
        throw error;
    }
};
