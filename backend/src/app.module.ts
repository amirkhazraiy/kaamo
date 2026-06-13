import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { RefreshSession } from './auth/refresh-session.entity';
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

function createTypeOrmOptions(config: ConfigService) {
  return {
    type: 'mysql' as const,
    host: config.get<string>('DB_HOST') ?? 'localhost',
    port: Number(config.get<string>('DB_PORT') ?? 3306),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD'),
    database: config.get<string>('DB_NAME'),
    entities: [User, Product, RefreshSession],
    synchronize: false,
    charset: 'utf8mb4',
  };
}
