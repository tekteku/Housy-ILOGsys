-- Reset user passwords for testing
-- Note: In production, passwords should be properly hashed with bcrypt

-- Reset to simple passwords for testing (these will need to be hashed by the API)
UPDATE users SET password = '$2a$10$xVqhTn0Y9xVG4RYs9A3AeuVfwVobJdnl1Xk1aI5XzTlQyRqzZ6kHC' WHERE username = 'admin';
UPDATE users SET password = '$2a$10$xVqhTn0Y9xVG4RYs9A3AeuVfwVobJdnl1Xk1aI5XzTlQyRqzZ6kHC' WHERE username = 'client1';  
UPDATE users SET password = '$2a$10$xVqhTn0Y9xVG4RYs9A3AeuVfwVobJdnl1Xk1aI5XzTlQyRqzZ6kHC' WHERE username = 'taher';
UPDATE users SET password = '$2a$10$xVqhTn0Y9xVG4RYs9A3AeuVfwVobJdnl1Xk1aI5XzTlQyRqzZ6kHC' WHERE username = 'super_admin';
UPDATE users SET password = '$2a$10$xVqhTn0Y9xVG4RYs9A3AeuVfwVobJdnl1Xk1aI5XzTlQyRqzZ6kHC' WHERE username = 'client2';

-- Verify the changes
SELECT id, username, email, role, 
       CASE 
         WHEN password = '$2a$10$xVqhTn0Y9xVG4RYs9A3AeuVfwVobJdnl1Xk1aI5XzTlQyRqzZ6kHC' 
         THEN 'test password set' 
         ELSE 'different password' 
       END as password_status
FROM users 
ORDER BY id;
