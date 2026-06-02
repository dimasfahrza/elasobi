import { supabase } from './supabase.js';

let currentUser = null;
const listeners = new Set();

export const onAuthChange = (cb) => { listeners.add(cb); return () => listeners.delete(cb); };
const notify = () => listeners.forEach(cb => cb(currentUser));

export const initAuth = async () => {
  const { data } = await supabase.auth.getSession();
  currentUser = data?.session?.user ?? null;
  notify();
  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    notify();
  });
};

export const getUser    = () => currentUser;
export const isLoggedIn = () => !!currentUser;

export const checkAdminRole = async () => {
  if (!currentUser) return false;
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .maybeSingle();
  if (error) { console.error('[checkAdminRole]', error.message); return false; }
  return data?.role === 'admin';
};

export const signUp = async (email, password, fullName) =>
  supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });

export const signIn = async (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = async () => supabase.auth.signOut();
