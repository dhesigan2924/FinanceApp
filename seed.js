const fs = require('fs');

const generateData = () => {
  const names = [
    "Muthu", "Ramesh", "Karthik", "Ganesh", "Suresh", "Ravi", "Vijay", "Ajith", "Kamal", "Rajini",
    "Surya", "Vikram", "Dhanush", "Siva", "Karthi", "Prabhu", "Sathish", "Arun", "Bala", "Chandru",
    "Dinesh", "Elango", "Gopi", "Hari", "Ilan", "Jeeva", "Kannan", "Lakshman", "Mani", "Nandha"
  ];
  
  let nameIndex = 0;
  const getName = () => names[nameIndex++ % names.length];

  let sql = 'TRUNCATE TABLE borrowers CASCADE;\n\n';
  sql += 'INSERT INTO borrowers (id, name, phone, loan_type, principal_amount, interest_rate, amount_to_collect_per_schedule) VALUES\n';
  
  const borrowers = [];
  
  const getCollect = (principal, interest, divider) => {
    let collect = ((principal * (1 + interest/100)) / divider);
    if (collect > 1000) {
      return Math.round(collect / 100) * 100;
    } else {
      return Math.round(collect / 50) * 50;
    }
  };
  
  // 10 Daily (10k to 40k, round to 5k)
  for(let i=1; i<=10; i++) {
    const principal = (Math.floor(Math.random() * 7) * 5000) + 10000;
    const interest = 10;
    const collect = getCollect(principal, interest, 100);
    borrowers.push(`(gen_random_uuid(), '${getName()}', '987654321${i%10}', 'daily', ${principal}, ${interest}, ${collect})`);
  }
  
  // 8 Weekly (50k to 100k, round to 10k)
  for(let i=1; i<=8; i++) {
    const principal = (Math.floor(Math.random() * 6) * 10000) + 50000;
    const interest = 5;
    const collect = getCollect(principal, interest, 10);
    borrowers.push(`(gen_random_uuid(), '${getName()}', '987654322${i%10}', 'weekly', ${principal}, ${interest}, ${collect})`);
  }
  
  // 5 Monthly (2L to 10L, round to 50k)
  for(let i=1; i<=5; i++) {
    const principal = (Math.floor(Math.random() * 17) * 50000) + 200000;
    const interest = 3;
    const collect = getCollect(principal, interest, 12);
    borrowers.push(`(gen_random_uuid(), '${getName()}', '987654323${i%10}', 'monthly', ${principal}, ${interest}, ${collect})`);
  }
  
  sql += borrowers.join(',\n') + ';\n\n';
  
  sql += `
INSERT INTO collection_schedules (borrower_id, due_date, amount_due, status)
SELECT id, CURRENT_DATE, amount_to_collect_per_schedule, 'pending' FROM borrowers;

INSERT INTO transactions (borrower_id, type, amount, payment_method, date)
SELECT id, 'repayment', amount_to_collect_per_schedule, 
  CASE WHEN random() > 0.5 THEN 'cash' ELSE 'bank_1' END,
  CURRENT_DATE - (random() * 5 + 1) * INTERVAL '1 day'
FROM borrowers;

UPDATE borrowers SET total_interest_collected = amount_to_collect_per_schedule;
`;

  fs.writeFileSync('generate.sql', sql);
};

generateData();
