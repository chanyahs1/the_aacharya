USE ems_employee;

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS leave_types;

-- Create leave_types table first (no foreign key dependencies)
CREATE TABLE leave_types (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    max_days INT(11) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default leave types
INSERT INTO leave_types (name, max_days, description) VALUES
('Annual Leave', 20, 'Regular annual leave for all employees'),
('Sick Leave', 15, 'Leave for medical reasons'),
('Casual Leave', 10, 'Short-term leave for personal matters'),
('Maternity Leave', 180, 'Leave for childbirth and care'),
('Paternity Leave', 15, 'Leave for new fathers'),
('Unpaid Leave', 30, 'Leave without pay for extended periods');

-- Create leave_balances table (depends on leave_types and employees_table)
CREATE TABLE leave_balances (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(100) NOT NULL,
    leave_type_id INT(11) NOT NULL,
    year INT(11) NOT NULL,
    total_days INT(11) NOT NULL,
    used_days INT(11) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees_table(empID) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    UNIQUE KEY unique_balance (employee_id, leave_type_id, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create leave_requests table (depends on leave_types, employees_table, and leave_balances)
CREATE TABLE leave_requests (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(100) NOT NULL,
    leave_type_id INT(11) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT(11) NOT NULL,
    reason TEXT,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    approved_by VARCHAR(100),
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees_table(empID) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees_table(empID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create initial leave balances for existing employees
INSERT INTO leave_balances (employee_id, leave_type_id, year, total_days)
SELECT 
    e.empID as employee_id,
    lt.id as leave_type_id,
    YEAR(CURRENT_DATE) as year,
    lt.max_days as total_days
FROM employees_table e
CROSS JOIN leave_types lt
WHERE NOT EXISTS (
    SELECT 1 FROM leave_balances lb 
    WHERE lb.employee_id = e.empID 
    AND lb.leave_type_id = lt.id 
    AND lb.year = YEAR(CURRENT_DATE)
); 