import { supabase } from '../supabase.js';

let currentUser = null;
const listeners = new Set();

export const onAdminAuthChange = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const notify = () => listeners.forEach(cb => cb(currentUser));

export const initAdminAuth = async () => {
  const { data } = await supabase.auth.getSession();
  currentUser = data?.session?.user ?? null;
  notify();

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    notify();
  });
};

export const getAdminUser    = () => currentUser;
export const isAdminLoggedIn = () => !!currentUser;

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

export const adminSignIn = async (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const adminSignOut = async () => {
  await supabase.auth.signOut();
  window.location.href = 'index.html#/login';
};
