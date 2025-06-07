-- First, let's check if we have any employees
SELECT empID, name, surname FROM employees_table;

-- Then initialize leave balances for all employees
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