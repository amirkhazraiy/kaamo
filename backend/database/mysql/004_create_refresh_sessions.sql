USE arcopal_store;

CREATE TABLE IF NOT EXISTS refresh_sessions (
  id VARCHAR(36) NOT NULL,
  userId INT NOT NULL,
  tokenHash CHAR(64) NOT NULL,
  expiresAt DATETIME NOT NULL,
  revokedAt DATETIME NULL,
  replacedByTokenHash CHAR(64) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_refresh_sessions_tokenHash (tokenHash),
  INDEX IX_refresh_sessions_userId (userId),
  INDEX IX_refresh_sessions_expiresAt (expiresAt),
  CONSTRAINT FK_refresh_sessions_users
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
