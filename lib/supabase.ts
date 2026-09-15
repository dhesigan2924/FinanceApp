import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hznrmecbhocdipeqjzmx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bnJtZWNiaG9jZGlwZXFqem14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzODI5NjYsImV4cCI6MjEwNDk1ODk2Nn0.FekeLv0ImfUkNFL3ryvJb7hZjAr2Z9n5nmX2xCyho10';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});
