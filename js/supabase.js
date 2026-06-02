// =====================================================
//  SUPABASE CLIENT
//  Replace SUPABASE_URL and SUPABASE_ANON_KEY with your
//  project credentials from https://app.supabase.com
// =====================================================

const SUPABASE_URL     = 'https://weuhzwltefdervbkjjhq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndldWh6d2x0ZWZkZXJ2YmtqamhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0Mjc4MTUsImV4cCI6MjA5MzAwMzgxNX0.cL1g5WkKo5w6jR9cRu9F2oXHW9XPPkNOd5tjcCv2pAc';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseConfigured = () =>
  !SUPABASE_URL.includes('YOUR-PROJECT-ID') &&
  !SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY');
