-- RUN THIS ENTIRE SCRIPT IN YOUR SUPABASE SQL EDITOR TO WIPE THE OLD DATA AND CREATE THE NEW APP

-- 1. DROP OLD TABLES (if they exist)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS installments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS collection_schedules CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS borrowers CASCADE;

-- 2. CREATE NEW TABLES

-- Borrowers Table
CREATE TABLE borrowers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('daily', 'weekly', 'monthly', 'lumpsum')),
  principal_amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  amount_to_collect_per_schedule NUMERIC NOT NULL, -- e.g., collect 500 daily
  total_principal_collected NUMERIC DEFAULT 0,
  total_interest_collected NUMERIC DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection Schedules Table (What dad needs to collect)
CREATE TABLE collection_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  borrower_id UUID REFERENCES borrowers(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  amount_due NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'excused')),
  excuse_audio_url TEXT,
  excuse_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table (Actual money movement: Repayments & Top-ups)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  borrower_id UUID REFERENCES borrowers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('repayment', 'topup')),
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_1', 'bank_2', 'bank_3', 'bank_4')),
  is_principal BOOLEAN DEFAULT FALSE, -- Did they pay off principal or just interest?
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE RLS (Simplified for no-login architecture)
ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all anon" ON borrowers FOR ALL USING (true);
CREATE POLICY "Allow all anon" ON collection_schedules FOR ALL USING (true);
CREATE POLICY "Allow all anon" ON transactions FOR ALL USING (true);

-- 4. CREATE STORAGE BUCKET FOR AUDIO EXCUSES
-- Note: You might need to manually create this bucket in the Supabase Dashboard -> Storage if the SQL fails, but we will try it here.
INSERT INTO storage.buckets (id, name, public) VALUES ('excuses', 'excuses', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Allow all anon to upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'excuses');
CREATE POLICY "Allow all anon to read" ON storage.objects FOR SELECT USING (bucket_id = 'excuses');
