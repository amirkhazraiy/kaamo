interface UploadedProductImage {
    filename: string;
}
export declare class UploadsController {
    uploadProductImage(file?: UploadedProductImage): {
        imageUrl: string;
    };
}
export {};
