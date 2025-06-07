-- First, ensure we have leave types
INSERT INTO leave_types (name, max_days) VALUES 
('Annual Leave', 20),
('Sick Leave', 15),
('Casual Leave', 10),
('Maternity Leave', 180),
('Paternity Leave', 15),
('Unpaid Leave', 30)
ON DUPLICATE KEY UPDATE max_days = VALUES(max_days);

-- Then, initialize leave balances for all employees for the current year
INSERT INTO leave_balances (employee_id, leave_type_id, year, total_days, used_days)
SELECT 
    e.empID,
    lt.id,
    YEAR(CURRENT_DATE),
    lt.max_days,
    0
FROM employees_table e
CROSS JOIN leave_types lt
WHERE NOT EXISTS (
    SELECT 1 
    FROM leave_balances lb 
    WHERE lb.employee_id = e.empID 
    AND lb.leave_type_id = lt.id 
    AND lb.year = YEAR(CURRENT_DATE)
); 