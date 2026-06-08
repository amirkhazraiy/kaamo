IF DB_ID(N'ArcopalStore') IS NULL
BEGIN
  CREATE DATABASE ArcopalStore;
END;
GO

USE ArcopalStore;
GO

IF OBJECT_ID(N'dbo.users', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_users PRIMARY KEY,
    email NVARCHAR(255) NOT NULL,
    passwordHash NVARCHAR(255) NOT NULL,
    name NVARCHAR(120) NULL,
    role NVARCHAR(50) NOT NULL CONSTRAINT DF_users_role DEFAULT N'admin',
    isActive BIT NOT NULL CONSTRAINT DF_users_isActive DEFAULT 1,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_users_createdAt DEFAULT SYSUTCDATETIME(),
    updatedAt DATETIME2 NOT NULL CONSTRAINT DF_users_updatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_users_email UNIQUE (email)
  );
END;
GO

IF OBJECT_ID(N'dbo.products', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.products (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_products PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    discountPrice DECIMAL(18, 2) NULL,
    stock INT NOT NULL CONSTRAINT DF_products_stock DEFAULT 0,
    category NVARCHAR(100) NOT NULL,
    imageUrl NVARCHAR(500) NOT NULL,
    imageUrls NVARCHAR(MAX) NULL,
    isActive BIT NOT NULL CONSTRAINT DF_products_isActive DEFAULT 1,
    sku NVARCHAR(80) NULL,
    brand NVARCHAR(100) NULL,
    persons INT NULL,
    pieces INT NULL,
    lowStockThreshold INT NULL,
    featured BIT NOT NULL CONSTRAINT DF_products_featured DEFAULT 0,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_products_createdAt DEFAULT SYSUTCDATETIME(),
    updatedAt DATETIME2 NOT NULL CONSTRAINT DF_products_updatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_products_price CHECK (price >= 0),
    CONSTRAINT CK_products_discountPrice CHECK (discountPrice IS NULL OR discountPrice >= 0),
    CONSTRAINT CK_products_discount_lt_price CHECK (discountPrice IS NULL OR discountPrice < price),
    CONSTRAINT CK_products_stock CHECK (stock >= 0)
  );
END;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = N'IX_products_category' AND object_id = OBJECT_ID(N'dbo.products')
)
BEGIN
  CREATE INDEX IX_products_category ON dbo.products(category);
END;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = N'IX_products_isActive' AND object_id = OBJECT_ID(N'dbo.products')
)
BEGIN
  CREATE INDEX IX_products_isActive ON dbo.products(isActive);
END;
GO
