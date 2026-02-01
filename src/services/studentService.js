import { supabase } from '../config/supabase';

/**
 * Create a new student using Supabase Auth + Database
 */
export const createStudent = async (studentData, adminCredentials) => {
    const { name, email, phone, password, rollNumber } = studentData;

    try {
        // 1. Create Supabase Auth account
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: password || 'gietstudent', // Default password
            options: {
                data: {
                    name,
                    role: 'student'
                }
            }
        });

        if (authError) throw authError;

        const userId = authData.user?.id;
        if (!userId) throw new Error('Failed to create auth account');

        // 2. Save student profile to Supabase database
        const { error: dbError } = await supabase
            .from('users')
            .insert([
                {
                    id: userId,
                    name,
                    email,
                    phone,
                    roll_number: rollNumber,
                    role: 'student',
                    is_blocked: false
                }
            ]);

        if (dbError) {
            console.error('Database Error:', dbError);
            throw new Error('Auth account created but failed to save profile');
        }

        // 3. Sign out the new student and re-authenticate admin
        await supabase.auth.signOut();

        if (adminCredentials) {
            await supabase.auth.signInWithPassword({
                email: adminCredentials.email,
                password: adminCredentials.password
            });
        }

        return { success: true, uid: userId };
    } catch (error) {
        console.error('Error creating student:', error);
        throw error;
    }
};

/**
 * Get all students from Supabase
 */
export const getStudents = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'student')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
};

/**
 * Toggle block status for a student
 */
export const toggleBlockStudent = async (uid, currentStatus) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({ is_blocked: !currentStatus })
            .eq('id', uid);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error toggling student block status:', error);
        throw error;
    }
};
