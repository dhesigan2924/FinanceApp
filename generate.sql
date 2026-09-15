TRUNCATE TABLE borrowers CASCADE;

INSERT INTO borrowers (id, name, phone, loan_type, principal_amount, interest_rate, amount_to_collect_per_schedule) VALUES
(gen_random_uuid(), 'Muthu', '9876543211', 'daily', 15000, 10, 150),
(gen_random_uuid(), 'Ramesh', '9876543212', 'daily', 20000, 10, 200),
(gen_random_uuid(), 'Karthik', '9876543213', 'daily', 40000, 10, 450),
(gen_random_uuid(), 'Ganesh', '9876543214', 'daily', 25000, 10, 300),
(gen_random_uuid(), 'Suresh', '9876543215', 'daily', 35000, 10, 400),
(gen_random_uuid(), 'Ravi', '9876543216', 'daily', 15000, 10, 150),
(gen_random_uuid(), 'Vijay', '9876543217', 'daily', 20000, 10, 200),
(gen_random_uuid(), 'Ajith', '9876543218', 'daily', 35000, 10, 400),
(gen_random_uuid(), 'Kamal', '9876543219', 'daily', 40000, 10, 450),
(gen_random_uuid(), 'Rajini', '9876543210', 'daily', 30000, 10, 350),
(gen_random_uuid(), 'Surya', '9876543221', 'weekly', 90000, 5, 9500),
(gen_random_uuid(), 'Vikram', '9876543222', 'weekly', 50000, 5, 5300),
(gen_random_uuid(), 'Dhanush', '9876543223', 'weekly', 50000, 5, 5300),
(gen_random_uuid(), 'Siva', '9876543224', 'weekly', 60000, 5, 6300),
(gen_random_uuid(), 'Karthi', '9876543225', 'weekly', 70000, 5, 7400),
(gen_random_uuid(), 'Prabhu', '9876543226', 'weekly', 70000, 5, 7400),
(gen_random_uuid(), 'Sathish', '9876543227', 'weekly', 100000, 5, 10500),
(gen_random_uuid(), 'Arun', '9876543228', 'weekly', 70000, 5, 7400),
(gen_random_uuid(), 'Bala', '9876543231', 'monthly', 850000, 3, 73000),
(gen_random_uuid(), 'Chandru', '9876543232', 'monthly', 800000, 3, 68700),
(gen_random_uuid(), 'Dinesh', '9876543233', 'monthly', 250000, 3, 21500),
(gen_random_uuid(), 'Elango', '9876543234', 'monthly', 450000, 3, 38600),
(gen_random_uuid(), 'Gopi', '9876543235', 'monthly', 450000, 3, 38600);


INSERT INTO collection_schedules (borrower_id, due_date, amount_due, status)
SELECT id, CURRENT_DATE, amount_to_collect_per_schedule, 'pending' FROM borrowers;

INSERT INTO transactions (borrower_id, type, amount, payment_method, date)
SELECT id, 'repayment', amount_to_collect_per_schedule, 
  CASE WHEN random() > 0.5 THEN 'cash' ELSE 'bank_1' END,
  CURRENT_DATE - (random() * 5 + 1) * INTERVAL '1 day'
FROM borrowers;

UPDATE borrowers SET total_interest_collected = amount_to_collect_per_schedule;
