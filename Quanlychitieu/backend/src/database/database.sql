DROP DATABASE IF EXISTS quanlychitieu;

CREATE DATABASE quanlychitieu
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE quanlychitieu;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);


CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoryId INT,
    userId INT,
    description VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    expenseDate DATE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId)
        REFERENCES categories(id)
        ON DELETE SET NULL,
    FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    month INT NOT NULL,
    year INT NOT NULL,
    limitAmount DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE
);

INSERT INTO users(username,email,password)
VALUES
(
    'obito',
    'caprap@gmail.com',
    '123456'
);

INSERT INTO categories(name,description)
VALUES
('Ăn uống','Chi phí ăn uống'),
('Đi lại','Chi phí đi lại'),
('Giải trí','Chi phí giải trí'),
('Học tập','Chi phí học tập');

INSERT INTO expenses(
    categoryId,
    userId,
    description,
    amount,
    expenseDate
)
VALUES
(
    1,
    1,
    'Cơm trưa',
    50000,
    '2026-06-21'
),

(
    2,
    1,
    'Đổ xăng',
    100000,
    '2026-06-21'
);

INSERT INTO budgets(
    userId,
    month,
    year,
    limitAmount
)
VALUES
(
    1,
    6,
    2026,
    5000000
);

