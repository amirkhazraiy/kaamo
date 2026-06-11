"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const dotenv_1 = require("dotenv");
const promise_1 = __importDefault(require("mysql2/promise"));
(0, dotenv_1.config)();
const sqlServerHost = process.env.SQLSERVER_HOST ?? 'localhost';
const sqlServerPort = process.env.SQLSERVER_PORT ?? '1433';
const sqlServerDatabase = process.env.SQLSERVER_DATABASE ?? 'ArcopalStore';
async function main() {
    const users = readSqlServerJson('users');
    const products = readSqlServerJson('products');
    const connection = await promise_1.default.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? 3306),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8mb4',
    });
    try {
        await connection.beginTransaction();
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DELETE FROM products');
        await connection.query('DELETE FROM users');
        for (const user of users) {
            await connection.execute(`
          INSERT INTO users (id, email, passwordHash, name, role, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                user.id,
                user.email,
                user.passwordHash,
                user.name,
                user.role,
                user.isActive,
                toMysqlDate(user.createdAt),
                toMysqlDate(user.updatedAt),
            ]);
        }
        for (const product of products) {
            await connection.execute(`
          INSERT INTO products (
            id, title, description, price, discountPrice, stock, category, imageUrl, imageUrls,
            isActive, sku, brand, persons, pieces, lowStockThreshold, featured, createdAt, updatedAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                product.id,
                product.title,
                product.description,
                product.price,
                product.discountPrice,
                product.stock,
                product.category,
                product.imageUrl,
                product.imageUrls,
                product.isActive,
                product.sku,
                product.brand,
                product.persons,
                product.pieces,
                product.lowStockThreshold,
                product.featured,
                toMysqlDate(product.createdAt),
                toMysqlDate(product.updatedAt),
            ]);
        }
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        await connection.commit();
        console.log(`Migrated ${users.length} users and ${products.length} products to MySQL.`);
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        await connection.end();
    }
}
function readSqlServerJson(table) {
    const query = table === 'users'
        ? `
          SET NOCOUNT ON;
          SELECT id, email, passwordHash, name, role, isActive, createdAt, updatedAt
          FROM dbo.users
          FOR JSON PATH;
        `
        : `
          SET NOCOUNT ON;
          SELECT id, title, description, price, discountPrice, stock, category, imageUrl, imageUrls,
                 isActive, sku, brand, persons, pieces, lowStockThreshold, featured, createdAt, updatedAt
          FROM dbo.products
          FOR JSON PATH;
        `;
    const result = (0, child_process_1.spawnSync)('sqlcmd', [
        '-S',
        `${sqlServerHost},${sqlServerPort}`,
        '-d',
        sqlServerDatabase,
        '-E',
        '-C',
        '-W',
        '-h',
        '-1',
        '-y',
        '0',
        '-Y',
        '0',
        '-Q',
        query,
    ], {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 20,
    });
    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || `sqlcmd failed while reading ${table}.`);
    }
    const json = result.stdout.trim();
    return json ? JSON.parse(json) : [];
}
function toMysqlDate(value) {
    return new Date(value).toISOString().slice(0, 19).replace('T', ' ');
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=migrate-sqlserver-to-mysql.js.map