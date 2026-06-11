"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const uploadDirectory = (0, path_1.join)(process.cwd(), 'uploads', 'products');
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);
let UploadsController = class UploadsController {
    uploadProductImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('Image file is required');
        }
        return {
            imageUrl: `/uploads/products/${file.filename}`,
        };
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('product-image'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload product image' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: (_request, _file, callback) => {
                if (!(0, fs_1.existsSync)(uploadDirectory)) {
                    (0, fs_1.mkdirSync)(uploadDirectory, { recursive: true });
                }
                callback(null, uploadDirectory);
            },
            filename: (_request, file, callback) => {
                const extension = (0, path_1.extname)(file.originalname).toLowerCase();
                callback(null, `${(0, crypto_1.randomUUID)()}${extension}`);
            },
        }),
        fileFilter: (_request, file, callback) => {
            if (!allowedImageTypes.has(file.mimetype)) {
                callback(new common_1.BadRequestException('Only image files are allowed'), false);
                return;
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UploadsController.prototype, "uploadProductImage", null);
exports.UploadsController = UploadsController = __decorate([
    (0, swagger_1.ApiTags)('uploads'),
    (0, common_1.Controller)('uploads')
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map