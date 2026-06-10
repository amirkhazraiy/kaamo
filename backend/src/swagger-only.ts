import { Module, ServiceUnavailableException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { UploadsController } from './uploads/uploads.controller';

const notAvailable = () => {
  throw new ServiceUnavailableException(
    'This local server only serves Swagger documentation. Start the real backend with a working database to test this endpoint.',
  );
};

@Module({
  controllers: [AuthController, ProductsController, UploadsController],
  providers: [
    {
      provide: AuthService,
      useValue: {
        login: notAvailable,
      },
    },
    {
      provide: ProductsService,
      useValue: {
        findAll: notAvailable,
        findOne: notAvailable,
        create: notAvailable,
        update: notAvailable,
        remove: notAvailable,
      },
    },
  ],
})
class SwaggerOnlyModule {}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(SwaggerOnlyModule);
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Arcopal Store API')
    .setDescription('NestJS REST API for Arcopal store authentication and product management.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  await app.listen(3000);
}

void bootstrap();
