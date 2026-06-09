# Arcopal NestJS Backend

NestJS REST API for the Angular Arcopal store frontend.

## Local Setup

```bash
cd backend
npm install
copy .env.example .env
```

Update `.env` with your MySQL connection settings:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=arcopal_store
DB_USERNAME=arcopal_user
DB_PASSWORD=your-mysql-password
```

## MySQL Database

Run this script in MySQL Workbench, phpMyAdmin, or your hosting control panel:

```text
backend/database/mysql/001_create_tables.sql
```

Then seed the first admin user:

```bash
npm run seed:admin
```

The seed command uses `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` from `.env`, hashes the password with bcrypt, and upserts the admin user.

## Migrate Existing SQL Server Data To MySQL

1. Create the MySQL tables first:

```text
backend/database/mysql/001_create_tables.sql
```

2. Fill these values in `backend/.env`:

```env
DB_HOST=your-mysql-host
DB_PORT=3306
DB_NAME=arcopal_store
DB_USERNAME=your-mysql-user
DB_PASSWORD=your-mysql-password

SQLSERVER_HOST=localhost
SQLSERVER_PORT=1433
SQLSERVER_DATABASE=ArcopalStore
```

3. Run the migration from your Windows machine where SQL Server is reachable:

```bash
npm run migrate:sqlserver-to-mysql
```

The migration keeps existing bcrypt password hashes and copies users/products, including product image URLs.

## Run

Backend:

```bash
cd backend
npm run start:dev
```

Frontend from the repository root:

```bash
npm start
```

Default URLs:

- Angular: `http://localhost:4200`
- NestJS API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

## Endpoints

- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` requires `Authorization: Bearer <token>`
- `PATCH /api/products/:id` requires `Authorization: Bearer <token>`
- `DELETE /api/products/:id` requires `Authorization: Bearer <token>`
- `POST /api/uploads/product-image` requires `Authorization: Bearer <token>`
