import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) throw new BadRequestException("File is required");
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      throw new BadRequestException("File too large (max 5MB)");
    }
    return file;
  }
}
