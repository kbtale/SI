import { writable } from 'svelte/store';
import { supabase } from './supabaseClient.js';

function createAuthStore() {
    const { subscribe, set, update } = writable({
        session: null,
        user: null,
        loading: true,
        error: null
    });

    return {
        subscribe,
        
        async initialize() {
            // Get initial session
            const { data: { session } } = await supabase.auth.getSession();
            update(state => ({ ...state, session, user: session?.user || null, loading: false }));

            // Listen for auth changes recursively 
            supabase.auth.onAuthStateChange((_event, session) => {
                update(state => ({ ...state, session, user: session?.user || null }));
            });
        },

        async signUp(email, password, displayName) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
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
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
             } catch (err) {
                update(state => ({ ...state, error: err.message }));
             }
        },
        
        clearError() {
            update(state => ({ ...state, error: null }));
        }
    };
}

export const authStore = createAuthStore();
