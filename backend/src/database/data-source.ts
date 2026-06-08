import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

config();

const useWindowsAuth = process.env.DB_AUTH_TYPE === 'windows';
const host = process.env.DB_HOST ?? 'localhost';
const port = Number(process.env.DB_PORT ?? 1433);
const database = process.env.DB_NAME;

const dataSourceOptions: DataSourceOptions = {
  type: 'mssql',
  host,
  port,
  database,
  entities: [User, Product],
  synchronize: false,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    trustedConnection: useWindowsAuth,
  } as Record<string, unknown>,
};

if (useWindowsAuth) {
  Object.assign(dataSourceOptions, {
    driver: require('mssql/msnodesqlv8'),
    extra: {
      connectionString: createWindowsConnectionString(host, port, database),
    },
  });
} else {
  Object.assign(dataSourceOptions, {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });
}

export const AppDataSource = new DataSource(dataSourceOptions);

function createWindowsConnectionString(
  host: string,
  port: number,
  database: string | undefined,
): string {
  const driver = process.env.DB_ODBC_DRIVER ?? 'ODBC Driver 17 for SQL Server';
  const encrypt = process.env.DB_ENCRYPT === 'true' ? 'Yes' : 'No';
  const trustServerCertificate =
    process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false' ? 'Yes' : 'No';

  return [
    `Driver={${driver}}`,
    `Server=${host},${port}`,
    `Database=${database}`,
    'Trusted_Connection=Yes',
    `Encrypt=${encrypt}`,
    `TrustServerCertificate=${trustServerCertificate}`,
  ].join(';');
}
