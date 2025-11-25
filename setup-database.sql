-- Housy Tunisia Database Setup Script
-- Run this after PostgreSQL installation

-- Create the main database
CREATE DATABASE housy_tunisia 
WITH 
    ENCODING='UTF8' 
    LC_COLLATE='C' 
    LC_CTYPE='C' 
    TEMPLATE=template0;

-- Connect to the new database
\c housy_tunisia;

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create a dedicated user for the application (optional but recommended)
CREATE USER housy_app WITH PASSWORD 'housy_secure_password_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE housy_tunisia TO housy_app;
GRANT ALL ON SCHEMA public TO housy_app;

-- Display success message
SELECT 'Housy Tunisia database setup completed successfully!' as status;
