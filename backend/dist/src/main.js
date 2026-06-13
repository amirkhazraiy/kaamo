"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const express_1 = require("express");
const helmet_1 = __importDefault(require("helmet"));
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const expressApp = app.getHttpAdapter().getInstance();
    const requestLogger = new common_1.Logger('HTTP');
    const isProduction = config.get('NODE_ENV') === 'production';
    const trustProxy = Number(config.get('TRUST_PROXY_HOPS') ?? 0);
    if (trustProxy > 0) {
        expressApp.set('trust proxy', trustProxy);
    }
    expressApp.disable('etag');
    app.use((0, helmet_1.default)({
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
    }));
    app.use('/uploads', (0, express_1.static)((0, path_1.join)(process.cwd(), 'uploads')));
    app.use((request, response, next) => {
        const startedAt = Date.now();
        const forwardedFor = request.headers['x-forwarded-for'];
        const clientIp = Array.isArray(forwardedFor)
            ? forwardedFor[0]
            : forwardedFor?.split(',')[0]?.trim() || request.ip;
        requestLogger.log(`--> ${request.method} ${request.originalUrl} ip=${clientIp} host=${request.headers.host ?? '-'} ua="${request.headers['user-agent'] ?? '-'}"`);
        response.on('finish', () => {
            requestLogger.log(`<-- ${request.method} ${request.originalUrl} status=${response.statusCode} duration=${Date.now() - startedAt}ms`);
        });
        next();
    });
    app.enableCors({
        origin: config.get('FRONTEND_ORIGIN') ?? 'http://localhost:4200',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.use((_request, response, next) => {
        response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.setHeader('Pragma', 'no-cache');
        response.setHeader('Expires', '0');
        next();
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    if (!isProduction) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('Arcopal Store API')
            .setDescription('NestJS REST API for Arcopal store authentication and product management.')
            .setVersion('1.0')
            .addCookieAuth('arcopal_access')
            .build();
        const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('api/docs', app, swaggerDocument);
    }
    const port = config.get('PORT') ?? 3000;
    await app.listen(port);
    logger.log(`Nest API is listening on port ${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map