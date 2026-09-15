-- INSTRUCTIONS FOR AUTOMATIC RESETS
-- Run this in your Supabase SQL editor to automatically create pending collection schedules!

-- 1. Create a function to generate the daily/weekly/monthly schedules
CREATE OR REPLACE FUNCTION generate_due_schedules()
RETURNS void AS $$
DECLARE
    today DATE := CURRENT_DATE;
BEGIN
    -- Daily: Always create a new schedule for active daily loans
    INSERT INTO collection_schedules (borrower_id, due_date, amount_due)
    SELECT id, today, amount_to_collect_per_schedule
    FROM borrowers
    WHERE loan_type = 'daily' AND status = 'active';

    -- Weekly: Only create if today is Sunday (0 = Sunday in Postgres)
    IF EXTRACT(DOW FROM today) = 0 THEN
        INSERT INTO collection_schedules (borrower_id, due_date, amount_due)
        SELECT id, today, amount_to_collect_per_schedule
        FROM borrowers
        WHERE loan_type = 'weekly' AND status = 'active';
    END IF;

    -- Monthly: Only create if today is the 1st of the month
    IF EXTRACT(DAY FROM today) = 1 THEN
        INSERT INTO collection_schedules (borrower_id, due_date, amount_due)
        SELECT id, today, amount_to_collect_per_schedule
        FROM borrowers
        WHERE loan_type = 'monthly' AND status = 'active';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Enable pg_cron extension (Available in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 3. Schedule the function to run every day at 1:00 AM
SELECT cron.schedule(
    'generate-schedules-1am',
    '0 1 * * *', -- At 01:00 every day
    $$ SELECT generate_due_schedules(); $$
);
