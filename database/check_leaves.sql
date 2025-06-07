-- Check leave types
SELECT * FROM leave_types;

-- Check leave balances for the current year
SELECT 
    e.empID,
    e.name,
    e.surname,
    lt.name as leave_type,
    lb.total_days,
    lb.used_days,
    (lb.total_days - lb.used_days) as remaining_days
FROM employees_table e
JOIN leave_balances lb ON e.empID = lb.employee_id
JOIN leave_types lt ON lb.leave_type_id = lt.id
WHERE lb.year = YEAR(CURRENT_DATE)
ORDER BY e.empID, lt.name; 