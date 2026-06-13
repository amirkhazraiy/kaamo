import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response, static as serveStatic } from 'express';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const expressApp = app.getHttpAdapter().getInstance();
  const requestLogger = new Logger('HTTP');

  const isProduction = config.get<string>('NODE_ENV') === 'production';
  const trustProxy = Number(config.get<string>('TRUST_PROXY_HOPS') ?? 0);

  if (trustProxy > 0) {
    expressApp.set('trust proxy', trustProxy);
  }

  expressApp.disable('etag');
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          imgSrc: ["'self'", 'data:'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: isProduction ? ["'self'"] : ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: false,
      frameguard: { action: 'deny' },
      hsts: isProduction
        ? {
            maxAge: 31_536_000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
      noSniff: true,
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );
  app.use('/uploads', serveStatic(join(process.cwd(), 'uploads')));

  app.use((request: Request, response: Response, next: NextFunction) => {
    const startedAt = Date.now();
    const forwardedFor = request.headers['x-forwarded-for'];
    const clientIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0]?.trim() || request.ip;

    requestLogger.log(
      `--> ${request.method} ${request.originalUrl} ip=${clientIp} host=${request.headers.host ?? '-'} ua="${request.headers['user-agent'] ?? '-'}"`,
    );

    response.on('finish', () => {
      requestLogger.log(
        `<-- ${request.method} ${request.originalUrl} status=${response.statusCode} duration=${Date.now() - startedAt}ms`,
      );
    });

    next();
  });

  app.enableCors({
    origin: config.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:4200',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Expires', '0');
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Arcopal Store API')
      .setDescription('NestJS REST API for Arcopal store authentication and product management.')
      .setVersion('1.0')
      .addCookieAuth('arcopal_access')
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, swaggerDocument);
  }

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
  logger.log(`Nest API is listening on port ${port}`);
}

void bootstrap();
