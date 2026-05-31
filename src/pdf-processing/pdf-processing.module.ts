import { Module } from '@nestjs/common';
import { PdfProcessingController } from './pdf-processing.controller';
import { PdfProcessingService } from './pdf-processing.service';

@Module({
  controllers: [PdfProcessingController],
  providers: [PdfProcessingService],
  exports: [PdfProcessingService],
})
export class PdfProcessingModule {}
