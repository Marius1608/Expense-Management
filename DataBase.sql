-- 1. Tabelul pentru roluri
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 3. Departments
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);


-- 2. Tabelul pentru utilizatori
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    role_id INT,
    department_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);


-- 4. Tabelul pentru categorii de cheltuieli
CREATE TABLE expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 5. Tabelul pentru cheltuieli
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_by INT,
    approved_by INT,
    category_id INT,
    department_id INT,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES expense_categories(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 6. Tabelul pentru aprobări de cheltuieli
CREATE TABLE expense_approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT,
    approved_by INT,
    approval_date DATE,
    status ENUM('Approved', 'Rejected') NOT NULL,
    comments VARCHAR(255),
    FOREIGN KEY (expense_id) REFERENCES expenses(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- 7. Tabelul pentru atașamentele cheltuielilor
CREATE TABLE attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(id)
);

-- 8. Tabelul pentru log-uri de audit
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100),
    action_details TEXT,
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 9. Tabelul intermediar pentru relația many-to-many între utilizatori și departamente
CREATE TABLE departments_users (
    user_id INT,
    department_id INT,
    PRIMARY KEY (user_id, department_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 10. Tabelul pentru setările aplicației (opțional)
CREATE TABLE app_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255)
);

-- 11.
CREATE TABLE expense_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_name VARCHAR(100),
    generated_by INT,
    start_date DATE,
    end_date DATE,
    total_amount DECIMAL(10, 2),
    report_status ENUM('Pending', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- 12.
CREATE TABLE report_filters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT,
    filter_type ENUM('Category', 'Department', 'User', 'Date Range') NOT NULL,
    filter_value VARCHAR(255),
    FOREIGN KEY (report_id) REFERENCES expense_reports(id)
);


