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
                .maybeSingle(); // Use maybeSingle to avoid 406/error if not found

            if (error) {
                console.log('User not found in database by ID, checking by email...');
                // User might not exist in users table yet, check by email
                const { data: emailData, error: emailError } = await supabase
                    .from('users')
                    .select('role, name')
                    .eq('email', email)
                    .maybeSingle(); // Use maybeSingle to avoid 406/error if not found

                if (emailError || !emailData) {
                    console.log('User not found in database by email');
                    return { role: null, name: null };
                }
                return { role: emailData.role, name: emailData.name };
            }

            return { role: data?.role || null, name: data?.name || null };
        } catch (error) {
            // Quiet the error if it's just a 406/404 from Supabase
            if (error.code !== 'PGRST116') {
                console.error('Error checking user role:', error);
            }
            return { role: null, name: null };
        }
    };

    // Listen to Supabase auth state changes
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user && mounted) {
                    const { role, name } = await checkUserRole(session.user.id, session.user.email);
                    if (ALLOWED_ROLES.includes(role)) {
                        setCurrentUser({ ...session.user, displayName: name });
                        setUserRole(role);
                    } else {
                        // Not an allowed role, sign out
                        await supabase.auth.signOut();
                        setCurrentUser(null);
                        setUserRole(null);
                    }
                }
            } catch (error) {
                console.error('Initialization error:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

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
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Login with email and password
    const loginWithEmail = async (email, password) => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        try {
            setLoading(true);
            await supabase.auth.signOut();
            sessionStorage.removeItem('admin_email');
            sessionStorage.removeItem('admin_password');
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        } finally {
            setLoading(false);
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
            {children}
        </AuthContext.Provider>
    );
};
