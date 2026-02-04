import { supabase } from '../config/supabase';

/**
 * Get all feedbacks from Supabase
 */
export const getFeedbacks = async () => {
    try {
        const { data, error } = await supabase
            .from('feedbacks')
            .select(`
                *,
                student:users!student_id(name, email, roll_number, role)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        throw error;
    }
};

/**
 * Update feedback status (e.g., mark as resolved)
 */
export const updateFeedbackStatus = async (id, status) => {
    try {
        const { data, error } = await supabase
            .from('feedbacks')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error updating feedback status:', error);
        throw error;
    }
};

/**
 * Admin reply to feedback
 */
export const replyToFeedback = async (id, responseText) => {
    try {
        const { data, error } = await supabase
            .from('feedbacks')
            .update({
                admin_response: responseText,
                responded_at: new Date().toISOString(),
                status: 'resolved'
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error replying to feedback:', error);
        throw error;
    }
};

/**
 * Delete feedback
 */
export const deleteFeedback = async (id) => {
    try {
        const { error } = await supabase
            .from('feedbacks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting feedback:', error);
        throw error;
    }
};
