import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

// Define allowed roles for portal access
const ALLOWED_ROLES = ['admin', 'faculty'];

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check user role in Supabase users table
    const checkUserRole = async (userId, email) => {
        try {
            console.log('Checking role for user:', userId);

            const { data, error } = await supabase
                .from('users')
                .select('role, name')
                .eq('id', userId)
                .single();

            if (error) {
                // User might not exist in users table yet, check by email
                const { data: emailData, error: emailError } = await supabase
                    .from('users')
                    .select('role, name')
                    .eq('email', email)
                    .single();

                if (emailError || !emailData) {
                    console.log('User not found in database');
                    return { role: null, name: null };
                }
                return { role: emailData.role, name: emailData.name };
            }

            return { role: data?.role || null, name: data?.name || null };
        } catch (error) {
            console.error('Error checking user role:', error);
            return { role: null, name: null };
        }
    };

    // Listen to Supabase auth state changes
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const { role, name } = await checkUserRole(session.user.id, session.user.email);
                if (ALLOWED_ROLES.includes(role)) {
                    setCurrentUser({ ...session.user, displayName: name });
                    setUserRole(role);
                } else {
                    await supabase.auth.signOut();
                    setCurrentUser(null);
                    setUserRole(null);
                }
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);

            if (event === 'SIGNED_IN' && session?.user) {
                const { role, name } = await checkUserRole(session.user.id, session.user.email);
                if (ALLOWED_ROLES.includes(role)) {
                    setCurrentUser({ ...session.user, displayName: name });
                    setUserRole(role);
                } else {
                    toast.error('Access denied. Admin or Faculty privileges required.');
                    await supabase.auth.signOut();
                    setCurrentUser(null);
                    setUserRole(null);
                }
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                setUserRole(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Login with email and password
    const loginWithEmail = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Check if user has allowed role
            const { role, name } = await checkUserRole(data.user.id, data.user.email);

            if (!ALLOWED_ROLES.includes(role)) {
                await supabase.auth.signOut();
                throw new Error('Access denied. Admin or Faculty privileges required.');
            }

            // Store credentials for re-login after creating users
            sessionStorage.setItem('admin_email', email);
            sessionStorage.setItem('admin_password', password);

            const welcomeMsg = role === 'admin' ? 'Welcome Admin!' : 'Welcome Faculty!';
            toast.success(welcomeMsg);
            return { success: true, role };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await supabase.auth.signOut();
            sessionStorage.removeItem('admin_email');
            sessionStorage.removeItem('admin_password');
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    // Check if user is admin
    const isAdmin = () => userRole === 'admin';

    // Check if user is faculty
    const isFaculty = () => userRole === 'faculty';

    const value = {
        currentUser,
        userRole,
        loginWithEmail,
        logout,
        loading,
        isAdmin,
        isFaculty
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
