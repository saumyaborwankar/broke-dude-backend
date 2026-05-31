import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  PdfProcessingService,
  ProcessingResult,
} from './pdf-processing.service';

@Controller('pdf-processing')
export class PdfProcessingController {
  constructor(private readonly pdfProcessingService: PdfProcessingService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(new BadRequestException('Only PDF files are allowed'), false);
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProcessingResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.pdfProcessingService.processPdf(
      file.buffer,
      file.originalname,
    );
  }
}
