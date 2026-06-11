export declare class CreateProductDto {
    title: string;
    description: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
    category: string;
    imageUrl: string;
    imageUrls?: string[];
    isActive?: boolean;
    sku?: string;
    brand?: string;
    persons?: number;
    pieces?: number;
    lowStockThreshold?: number;
    featured?: boolean;
}
