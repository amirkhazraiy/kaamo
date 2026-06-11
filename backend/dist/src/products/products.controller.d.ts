import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(): Promise<import("./product.entity").Product[]>;
    findOne(id: number): Promise<import("./product.entity").Product>;
    create(createProductDto: CreateProductDto): Promise<import("./product.entity").Product>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<import("./product.entity").Product>;
    remove(id: number): Promise<void>;
}
