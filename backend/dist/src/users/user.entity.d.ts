export declare class User {
    id: number;
    email: string;
    passwordHash: string;
    name: string | null;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
