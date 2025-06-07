-- First, make sure we're using the correct database
USE ems_employee;

-- Check if the employees_table exists and its structure
SHOW TABLES;
DESCRIBE employees_table;

-- Insert test employees
INSERT INTO employees_table (empID, name, surname, email, password, role, department, position, joining_date, status)
VALUES 
('EMP001', 'John', 'Doe', 'john.doe@company.com', 'password123', 'Employee', 'IT', 'Software Developer', '2024-01-01', 'Active'),
('EMP002', 'Jane', 'Smith', 'jane.smith@company.com', 'password123', 'Employee', 'HR', 'HR Manager', '2024-01-01', 'Active'),
('EMP003', 'Mike', 'Johnson', 'mike.johnson@company.com', 'password123', 'Employee', 'Finance', 'Accountant', '2024-01-01', 'Active');

-- Verify the employees were added
SELECT * FROM employees_table;

-- Now initialize leave balances for these employees
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

-- Verify leave balances were created
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
ORDER BY e.empID, lt.name; 