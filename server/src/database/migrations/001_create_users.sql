-- 001_create_users.sql

CREATE TYPE user_role AS ENUM ('tourist', 'guide', 'admin');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'tourist',
    
    -- Security Requirement for MVP:
    is_verified BOOLEAN DEFAULT FALSE, 
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);