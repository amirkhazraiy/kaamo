import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        message: string;
        token: string;
        user: {
            id: number;
            email: string;
            name: string | null;
            role: string;
        };
    }>;
}
