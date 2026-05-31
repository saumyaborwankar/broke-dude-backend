import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { PdfProcessingController } from './pdf-processing.controller';
import { PdfProcessingService } from './pdf-processing.service';

@Module({
  imports: [TransactionsModule],
  controllers: [PdfProcessingController],
  providers: [PdfProcessingService],
  exports: [PdfProcessingService],
})
export class PdfProcessingModule {}
