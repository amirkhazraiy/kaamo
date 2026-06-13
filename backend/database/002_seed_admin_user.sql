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

DECLARE @Email NVARCHAR(255) = N'YOUR_ADMIN_EMAIL_HERE';
DECLARE @Name NVARCHAR(120) = N'YOUR_ADMIN_NAME_HERE';
DECLARE @PasswordHash NVARCHAR(255) = N'YOUR_BCRYPT_PASSWORD_HASH_HERE';

IF @Email LIKE N'YOUR_%' OR @Name LIKE N'YOUR_%' OR @PasswordHash LIKE N'YOUR_%'
BEGIN
  THROW 50000, 'Replace all admin placeholders, or use npm run seed:admin.', 1;
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
