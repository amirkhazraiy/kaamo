USE ArcopalStore;
GO

IF OBJECT_ID(N'dbo.refresh_sessions', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.refresh_sessions (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_refresh_sessions PRIMARY KEY DEFAULT NEWID(),
    userId INT NOT NULL,
    tokenHash CHAR(64) NOT NULL,
    expiresAt DATETIME2 NOT NULL,
    revokedAt DATETIME2 NULL,
    replacedByTokenHash CHAR(64) NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_refresh_sessions_createdAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_refresh_sessions_tokenHash UNIQUE (tokenHash),
    CONSTRAINT FK_refresh_sessions_users FOREIGN KEY (userId) REFERENCES dbo.users(id) ON DELETE CASCADE
  );

  CREATE INDEX IX_refresh_sessions_userId ON dbo.refresh_sessions(userId);
  CREATE INDEX IX_refresh_sessions_expiresAt ON dbo.refresh_sessions(expiresAt);
END;
GO
