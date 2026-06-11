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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./product.entity");
let ProductsService = class ProductsService {
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    findAll() {
        return this.productsRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const product = await this.productsRepository.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('Product not found.');
        }
        return product;
    }
    async create(createProductDto) {
        this.validateDiscount(createProductDto.price, createProductDto.discountPrice);
        const imageUrls = this.normalizeImageUrls(createProductDto.imageUrl, createProductDto.imageUrls);
        const product = this.productsRepository.create({
            ...createProductDto,
            imageUrl: imageUrls[0],
            imageUrls,
            discountPrice: createProductDto.discountPrice ?? null,
            isActive: createProductDto.isActive ?? true,
            featured: createProductDto.featured ?? false,
        });
        return this.productsRepository.save(product);
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        const hasDiscountPrice = Object.prototype.hasOwnProperty.call(updateProductDto, 'discountPrice');
        const hasImages = Object.prototype.hasOwnProperty.call(updateProductDto, 'imageUrl') ||
            Object.prototype.hasOwnProperty.call(updateProductDto, 'imageUrls');
        const nextPrice = updateProductDto.price ?? product.price;
        const nextDiscount = hasDiscountPrice ? updateProductDto.discountPrice : product.discountPrice;
        this.validateDiscount(nextPrice, nextDiscount);
        Object.assign(product, updateProductDto);
        if (hasDiscountPrice) {
            product.discountPrice = updateProductDto.discountPrice ?? null;
        }
        if (hasImages) {
            const imageUrls = this.normalizeImageUrls(product.imageUrl, product.imageUrls ?? undefined);
            product.imageUrl = imageUrls[0];
            product.imageUrls = imageUrls;
        }
        return this.productsRepository.save(product);
    }
    async remove(id) {
        const result = await this.productsRepository.delete(id);
        if (!result.affected) {
            throw new common_1.NotFoundException('Product not found.');
        }
    }
    validateDiscount(price, discountPrice) {
        if (discountPrice !== null && discountPrice !== undefined && discountPrice >= price) {
            throw new common_1.BadRequestException('Discount price must be lower than price.');
        }
    }
    normalizeImageUrls(imageUrl, imageUrls) {
        const normalizedImageUrls = [...(imageUrls ?? []), imageUrl]
            .map((value) => value.trim())
            .filter(Boolean);
        const uniqueImageUrls = [...new Set(normalizedImageUrls)];
        if (uniqueImageUrls.length === 0) {
            throw new common_1.BadRequestException('At least one product image is required.');
        }
        return uniqueImageUrls;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map