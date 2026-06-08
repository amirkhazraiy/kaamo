import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
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

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const hasDiscountPrice = Object.prototype.hasOwnProperty.call(updateProductDto, 'discountPrice');
    const hasImages =
      Object.prototype.hasOwnProperty.call(updateProductDto, 'imageUrl') ||
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

  async remove(id: number): Promise<void> {
    const result = await this.productsRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Product not found.');
    }
  }

  private validateDiscount(price: number, discountPrice?: number | null): void {
    if (discountPrice !== null && discountPrice !== undefined && discountPrice >= price) {
      throw new BadRequestException('Discount price must be lower than price.');
    }
  }

  private normalizeImageUrls(imageUrl: string, imageUrls?: string[] | null): string[] {
    const normalizedImageUrls = [...(imageUrls ?? []), imageUrl]
      .map((value) => value.trim())
      .filter(Boolean);
    const uniqueImageUrls = [...new Set(normalizedImageUrls)];

    if (uniqueImageUrls.length === 0) {
      throw new BadRequestException('At least one product image is required.');
    }

    return uniqueImageUrls;
  }
}
