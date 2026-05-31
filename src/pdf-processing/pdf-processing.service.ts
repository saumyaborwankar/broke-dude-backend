import { Injectable } from '@nestjs/common';
import { ExtractorEngine } from './extractor/extractor-engine';
import { PdfPlumberExtractorStrategy } from './extractor/strategies/pdfplumber-extractor.strategy';
import type { ExtractorStrategy } from './extractor/extractor-strategy.interface';
import { CategorizerEngine } from './categorizer/categorizer-engine';
import { RegexCategorizerStrategy } from './categorizer/strategies/regex-categorizer.strategy';
import type { CategorizerStrategy } from './interfaces/categorizer-strategy.interface';

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

@Injectable()
export class PdfProcessingService {
  private extractorEngine: ExtractorEngine;
  private categorizerEngine: CategorizerEngine;

  constructor() {
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
    const extractedRows = await this.extractorEngine.extractTables(buffer);

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
}
