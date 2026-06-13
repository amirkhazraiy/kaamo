USE arcopal_store;

-- Recommended seed path:
--   cd backend
--   npm run seed:admin
--
-- That command hashes ADMIN_PASSWORD with bcryptjs and upserts the admin user.
-- This SQL-only fallback requires a bcrypt hash.

SET @Email = 'YOUR_ADMIN_EMAIL_HERE';
SET @Name = 'YOUR_ADMIN_NAME_HERE';
SET @PasswordHash = 'YOUR_BCRYPT_PASSWORD_HASH_HERE';

-- Replace every placeholder before running this fallback script.

INSERT INTO users (email, passwordHash, name, role, isActive)
VALUES (@Email, @PasswordHash, @Name, 'admin', TRUE)
ON DUPLICATE KEY UPDATE
  passwordHash = VALUES(passwordHash),
  name = VALUES(name),
  role = VALUES(role),
  isActive = VALUES(isActive),
  updatedAt = CURRENT_TIMESTAMP;
