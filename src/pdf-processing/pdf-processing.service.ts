import { Injectable } from '@nestjs/common';
import { ExtractorEngine } from './extractor/extractor-engine';
import { PdfPlumberExtractorStrategy } from './extractor/strategies/pdfplumber-extractor.strategy';
import type { ExtractorStrategy } from './extractor/extractor-strategy.interface';
import { CategorizerEngine } from './categorizer/categorizer-engine';
import { RegexCategorizerStrategy } from './categorizer/strategies/regex-categorizer.strategy';
import type { CategorizerStrategy } from './interfaces/categorizer-strategy.interface';
import { TransactionsService } from '../transactions/transactions.service';
import {
  Transaction,
  TransactionCategory,
  TransactionSubcategory,
  TransactionSource,
} from '../transactions/transaction.entity';

export interface ProcessedRow {
  description: string;
  amount: number;
  date: string;
  category: string;
  confidence: number;
}

export interface ProcessingResult {
  source: string;
  extractor: string;
  categorizer: string;
  rows: ProcessedRow[];
  totalRows: number;
  categorizedRows: number;
  uncategorizedRows: number;
}

export interface CreateFromPdfResult {
  created: Transaction[];
  skipped: number;
}

@Injectable()
export class PdfProcessingService {
  private extractorEngine: ExtractorEngine;
  private categorizerEngine: CategorizerEngine;

  constructor(
    private readonly transactionsService: TransactionsService,
  ) {
    this.extractorEngine = new ExtractorEngine(new PdfPlumberExtractorStrategy());
    this.categorizerEngine = new CategorizerEngine(new RegexCategorizerStrategy());
  }

  setExtractorStrategy(strategy: ExtractorStrategy): void {
    this.extractorEngine.setStrategy(strategy);
  }

  setCategorizerStrategy(strategy: CategorizerStrategy): void {
    this.categorizerEngine.setStrategy(strategy);
  }

  async processPdf(
    buffer: Buffer,
    originalName?: string,
  ): Promise<ProcessingResult> {
    const extractedRows = (await this.extractorEngine.extractTables(buffer)).map(
      (row) => ({ ...row, date: this.normalizeDate(row.date) }),
    );

    const categorized = this.categorizerEngine.categorizeBatch(extractedRows);

    const rows: ProcessedRow[] = extractedRows.map((row, i) => ({
      description: row.description,
      amount: row.amount,
      date: row.date,
      category: categorized[i].category,
      confidence: categorized[i].confidence,
    }));

    return {
      source: originalName ?? 'upload',
      extractor: this.extractorEngine.getStrategyName(),
      categorizer: this.categorizerEngine.getStrategyName(),
      rows,
      totalRows: rows.length,
      categorizedRows: rows.filter((r) => r.confidence >= 0.5).length,
      uncategorizedRows: rows.filter((r) => r.confidence < 0.5).length,
    };
  }

  async processAndCreateTransactions(
    buffer: Buffer,
    source: TransactionSource,
    originalName?: string,
  ): Promise<CreateFromPdfResult> {
    const extractedRows = (await this.extractorEngine.extractTables(buffer)).map(
      (row) => ({ ...row, date: this.normalizeDate(row.date) }),
    );

    const categorized = this.categorizerEngine.categorizeBatch(extractedRows);

    const created: Transaction[] = [];
    let skipped = 0;

    for (let i = 0; i < extractedRows.length; i++) {
      const row = extractedRows[i];
      const category = categorized[i].category;

      const duplicate = await this.transactionsService.findDuplicate(
        row.description,
        row.amount,
        row.date,
        source,
      );

      if (duplicate) {
        skipped++;
        continue;
      }

      const transaction = await this.transactionsService.create({
        description: row.description,
        amount: row.amount,
        date: row.date,
        category,
        source,
      });

      created.push(transaction);
    }

    return { created, skipped };
  }

  private normalizeDate(dateStr: string): string {
    const separators = /[/\-]/;
    const parts = dateStr.trim().split(separators).filter(Boolean);

    if (parts.length < 2) return dateStr;

    const month = parts[0]!.padStart(2, '0');
    const day = parts[1]!.padStart(2, '0');

    if (parts.length === 3) {
      const year =
        parts[2]!.length === 2
          ? `20${parts[2]}`
          : parts[2]!;
      return `${year}-${month}-${day}`;
    }

    const year = new Date().getFullYear().toString();
    return `${year}-${month}-${day}`;
  }

  private mapCategoryToSubcategory(
    category: TransactionCategory,
  ): TransactionSubcategory {
    switch (category) {
      case TransactionCategory.EATING_OUT:
        return TransactionSubcategory.EATING_OUT;
      case TransactionCategory.UBER:
        return TransactionSubcategory.UBER;
      case TransactionCategory.GROCERY:
        return TransactionSubcategory.GROCERY;
      case TransactionCategory.TRANSIT:
        return TransactionSubcategory.TRANSIT;
      case TransactionCategory.TRIP:
        return TransactionSubcategory.FLIGHT;
      default:
        return TransactionSubcategory.OTHER;
    }
  }
}
