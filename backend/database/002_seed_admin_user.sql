USE ArcopalStore;
GO

-- Recommended seed path:
--   cd backend
--   npm install
--   copy .env.example .env
--   npm run seed:admin
--
-- That command hashes ADMIN_PASSWORD with bcrypt and upserts the admin user.
-- This SQL-only fallback requires you to paste a bcrypt hash manually.

DECLARE @Email NVARCHAR(255) = N'admin@example.com';
DECLARE @Name NVARCHAR(120) = N'Arcopal Admin';
DECLARE @PasswordHash NVARCHAR(255) = N'REPLACE_WITH_BCRYPT_HASH';

IF @PasswordHash = N'REPLACE_WITH_BCRYPT_HASH'
BEGIN
  THROW 50000, 'Replace @PasswordHash with a bcrypt hash, or use npm run seed:admin.', 1;
END;

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = @Email)
BEGIN
  INSERT INTO dbo.users (email, passwordHash, name, role, isActive)
  VALUES (@Email, @PasswordHash, @Name, N'admin', 1);
END
ELSE
BEGIN
  UPDATE dbo.users
  SET passwordHash = @PasswordHash,
      name = @Name,
      role = N'admin',
      isActive = 1,
      updatedAt = SYSUTCDATETIME()
  WHERE email = @Email;
END;
GO
