import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

const uploadDirectory = join(process.cwd(), 'uploads', 'products');
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

interface UploadedProductImage {
  filename: string;
}

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  @Post('product-image')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          if (!existsSync(uploadDirectory)) {
            mkdirSync(uploadDirectory, { recursive: true });
          }

          callback(null, uploadDirectory);
        },
        filename: (_request, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          callback(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_request, file, callback) => {
        if (!allowedImageTypes.has(file.mimetype)) {
          callback(new BadRequestException('Only image files are allowed'), false);
          return;
        }

        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadProductImage(@UploadedFile() file?: UploadedProductImage) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return {
      imageUrl: `/uploads/products/${file.filename}`,
    };
  }
}
