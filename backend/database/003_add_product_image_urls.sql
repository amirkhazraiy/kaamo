USE ArcopalStore;
GO

IF COL_LENGTH(N'dbo.products', N'imageUrls') IS NULL
BEGIN
  ALTER TABLE dbo.products
  ADD imageUrls NVARCHAR(MAX) NULL;
END;
GO

UPDATE dbo.products
SET imageUrls = N'["' + STRING_ESCAPE(imageUrl, 'json') + N'"]'
WHERE imageUrls IS NULL
  AND imageUrl IS NOT NULL
  AND LTRIM(RTRIM(imageUrl)) <> N'';
GO
