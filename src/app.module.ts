import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { TransactionsModule } from './transactions/transactions.module';
import { PdfProcessingModule } from './pdf-processing/pdf-processing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    TransactionsModule,
    PdfProcessingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
