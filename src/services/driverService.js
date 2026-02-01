import { supabase } from '../config/supabase';

/**
 * Create a new driver using Supabase Auth + Database
 * Note: Admin credentials are used to re-authenticate after creating a new user
 */
export const createDriver = async (driverData, adminCredentials) => {
    const { name, email, phone, licenseNo, password } = driverData;

    try {
        // 1. Create Supabase Auth account for the driver
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: 'driver'
                }
            }
        });

        if (authError) throw authError;

        const userId = authData.user?.id;
        if (!userId) throw new Error('Failed to create auth account');

        // 2. Save driver profile to Supabase database
        const { error: dbError } = await supabase
            .from('users')
            .insert([
                {
                    id: userId,
                    name,
                    email,
                    phone,
                    license_no: licenseNo,
                    role: 'driver'
                }
            ]);

        if (dbError) {
            console.error('Database Error:', dbError);
            throw new Error('Auth account created but failed to save profile');
        }

        // 3. Sign out the new driver and re-authenticate admin
        await supabase.auth.signOut();

        if (adminCredentials) {
            await supabase.auth.signInWithPassword({
                email: adminCredentials.email,
                password: adminCredentials.password
            });
        }

        return { success: true, uid: userId };
    } catch (error) {
        console.error('Error creating driver:', error);
        throw error;
    }
};

/**
 * Get all drivers from Supabase
 */
export const getDrivers = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'driver')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching drivers:', error);
        throw error;
    }
};

/**
 * Delete a driver from Supabase
 */
export const deleteDriver = async (uid) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', uid);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting driver:', error);
        throw error;
    }
};
