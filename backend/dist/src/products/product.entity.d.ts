export declare class Product {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPrice: number | null;
    stock: number;
    category: string;
    imageUrl: string;
    imageUrls: string[] | null;
    isActive: boolean;
    sku: string | null;
    brand: string | null;
    persons: number | null;
    pieces: number | null;
    lowStockThreshold: number | null;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}
