# Arcopal NestJS Backend

NestJS REST API for the Angular Arcopal store frontend.

## Setup

```bash
cd backend
npm install
copy .env.example .env
```

Update `.env` with your SQL Server connection settings. For Windows Authentication, use:

```env
DB_AUTH_TYPE=windows
DB_HOST=localhost
DB_NAME=ArcopalStore
```

For SQL Server username/password login, use:

```env
DB_AUTH_TYPE=sql
DB_USERNAME=sa
DB_PASSWORD=your-strong-password
```

## Database

Open SQL Server Management Studio and run:

```text
backend/database/001_create_tables.sql
```

Then seed the first admin user:

```bash
npm run seed:admin
```

The seed command uses `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` from `.env`, hashes the password with bcrypt, and upserts the admin user.

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

## Endpoints

- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` requires `Authorization: Bearer <token>`
- `PATCH /api/products/:id` requires `Authorization: Bearer <token>`
- `DELETE /api/products/:id` requires `Authorization: Bearer <token>`
