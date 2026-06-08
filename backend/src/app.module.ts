import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { AuthModule } from './auth/auth.module';
import { Product } from './products/product.entity';
import { ProductsModule } from './products/products.module';
import { UploadsModule } from './uploads/uploads.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createTypeOrmOptions(config),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    UploadsModule,
  ],
})
export class AppModule {}

function createTypeOrmOptions(config: ConfigService): TypeOrmModuleOptions {
  const useWindowsAuth = config.get<string>('DB_AUTH_TYPE') === 'windows';
  const host = config.get<string>('DB_HOST') ?? 'localhost';
  const port = Number(config.get<string>('DB_PORT') ?? 1433);
  const database = config.get<string>('DB_NAME');
  const commonOptions: TypeOrmModuleOptions = {
    type: 'mssql',
    host,
    port,
    database,
    entities: [User, Product],
    synchronize: false,
    options: {
      encrypt: config.get<string>('DB_ENCRYPT') === 'true',
      trustServerCertificate: config.get<string>('DB_TRUST_SERVER_CERTIFICATE') !== 'false',
      trustedConnection: useWindowsAuth,
    } as Record<string, unknown>,
  };

  if (useWindowsAuth) {
    return {
      ...commonOptions,
      driver: require('mssql/msnodesqlv8'),
      extra: {
        connectionString: createWindowsConnectionString(config, host, port, database),
      },
    };
  }

  return {
    ...commonOptions,
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD'),
  };
}

function createWindowsConnectionString(
  config: ConfigService,
  host: string,
  port: number,
  database: string | undefined,
): string {
  const driver = config.get<string>('DB_ODBC_DRIVER') ?? 'ODBC Driver 17 for SQL Server';
  const encrypt = config.get<string>('DB_ENCRYPT') === 'true' ? 'Yes' : 'No';
  const trustServerCertificate =
    config.get<string>('DB_TRUST_SERVER_CERTIFICATE') !== 'false' ? 'Yes' : 'No';

  return [
    `Driver={${driver}}`,
    `Server=${host},${port}`,
    `Database=${database}`,
    'Trusted_Connection=Yes',
    `Encrypt=${encrypt}`,
    `TrustServerCertificate=${trustServerCertificate}`,
  ].join(';');
}
