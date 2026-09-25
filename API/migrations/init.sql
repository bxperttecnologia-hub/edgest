-- -- MySQL DDL: cria o schema base
-- CREATE DATABASE IF NOT EXISTS db_formHub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE db_formHub;

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(150),
  last_name VARCHAR(150),
  email VARCHAR(255) NOT NULL,
  photo text,
  password_hash VARCHAR(256) NOT NULL,
  password_salt VARCHAR(64) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_number VARCHAR(100),
  name varchar(200),
  email varchar(100),
  nationality VARCHAR(100),
  birth_date DATE,
  identity_type enum("BI","Passaporte"),
  identity_number varchar(50),
  identity_valid_data date,
  address VARCHAR(255),
  contact VARCHAR(255),
  status VARCHAR(50) DEFAULT 'prospective',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email) REFERENCES users(email) ON DELETE SET NULL
);

CREATE TABLE courses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) UNIQUE,
  title VARCHAR(255),
  description TEXT,
  duration_hours INT,
  level VARCHAR(100),
  price DECIMAL(12,2),
  payment_parcelas INT DEFAULT 1,
  language VARCHAR(50),
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT,
  name VARCHAR(255),
  start_date DATE,
  end_date DATE,
  capacity INT,
  instructor_id BIGINT,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE enrollments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT,
  class_id BIGINT,
  enrollment_date DATE,
  status VARCHAR(50) DEFAULT 'confirmed',
  parcelas_total INT,
  parcelas_pagas INT DEFAULT 0,
  valor_por_parcela DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id BIGINT,
  student_id BIGINT,
  parcela_numero INT,
  amount DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'AOA',
  method VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  transaction_reference VARCHAR(255),
  due_date DATE,
  paid_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL
);

-- Table to store notifications logs
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  error_message TEXT NULL,
  sent_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS instructors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name varchar(200),
  email varchar(200),
  contact VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `login_sessions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `session_id` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text NOT NULL,
  `userType` enum('admin','staff','student') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
