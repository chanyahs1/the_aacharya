-- Check leave balances for a specific employee
SELECT 
    e.empID,
    e.name,
    e.surname,
    lt.name as leave_type,
    lb.total_days,
    lb.used_days,
    (lb.total_days - lb.used_days) as remaining_days,
    lb.year
FROM employees_table e
JOIN leave_balances lb ON e.empID = lb.employee_id
JOIN leave_types lt ON lb.leave_type_id = lt.id
WHERE e.empID = ?  -- Replace ? with your employee ID
ORDER BY lt.name; 