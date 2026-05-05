import { writable } from 'svelte/store';
import { supabase } from './supabaseClient.js';

function createAuthStore() {
    const { subscribe, set, update } = writable({
        session: null,
        user: null,
        role: 'warehouse_staff',
        loading: true,
        recoveryMode: false,
        error: null
    });

    return {
        subscribe,
        
        async initialize() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const role = await this.fetchProfile(session.user.id);
                update(state => ({ ...state, session, user: session.user, role, loading: false }));
            } else {
                update(state => ({ ...state, loading: false }));
            }

            supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'PASSWORD_RECOVERY') {
                    update(state => ({ ...state, recoveryMode: true }));
                }

                if (session) {
                    const role = await this.fetchProfile(session.user.id);
                    update(state => ({ ...state, session, user: session.user, role }));
                } else {
                    update(state => ({ ...state, session: null, user: null, role: 'warehouse_staff', recoveryMode: false }));
                }
            });
        },

        async fetchProfile(userId) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', userId)
                    .single();
                
                if (error) throw error;
                return data?.role || 'warehouse_staff';
            } catch (err) {
                console.error("No se pudo cargar el perfil:", err.message);
                return 'warehouse_staff';
            }
        },

        async signUp(email, password, displayName) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: "https://ree-sistema-administrativo.vercel.app/",
                        data: {
                            displayName: displayName || email.split('@')[0]
                        }
                    }
                });
                if (error) throw error;
                // Supabase returns session=null if email confirmation is required by strict config
                update(state => ({ ...state, loading: false }));
                return data;
            } catch (err) {
                update(state => ({ ...state, error: err.message, loading: false }));
                throw err;
            }
        },

        async signIn(email, password) {
             update(state => ({ ...state, loading: true, error: null }));
             try {
                 const { data, error } = await supabase.auth.signInWithPassword({
                     email,
                     password
                 });
                 if (error) throw error;
                 
                 update(state => ({ ...state, loading: false }));
                 return data;
             } catch (err) {
                 update(state => ({ ...state, error: err.message, loading: false }));
                 throw err;
             }
        },

        async signOut() {
             try {
                // Limpieza manual de persistencia para evitar sesiones "pegajosas"
                Object.keys(localStorage).forEach(key => {
                    if (key.includes('supabase.auth.token') || key.includes('sb-')) {
                        localStorage.removeItem(key);
                    }
                });
                await supabase.auth.signOut();
             } catch (err) {
                console.error("Error al salir:", err);
             } finally {
                // Reseteo de estado y redirección dura al origen
                update(state => ({ ...state, session: null, user: null, role: 'warehouse_staff', recoveryMode: false }));
                // Set explicitly to root, then force reload to kill SPA state
                window.location.href = '/';
             }
        },

        async resetPassword(email) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: "https://ree-sistema-administrativo.vercel.app/",
                });
                if (error) throw error;
                update(state => ({ ...state, loading: false }));
                return true;
            } catch (err) {
                update(state => ({ ...state, error: err.message, loading: false }));
                throw err;
            }
        },

        async updatePassword(newPassword) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const { error } = await supabase.auth.updateUser({ password: newPassword });
                if (error) throw error;
                update(state => ({ ...state, loading: false, recoveryMode: false }));
                return true;
            } catch (err) {
                update(state => ({ ...state, error: err.message, loading: false }));
                throw err;
            }
        },
        
        clearError() {
            update(state => ({ ...state, error: null }));
        }
    };
}

export const authStore = createAuthStore();
