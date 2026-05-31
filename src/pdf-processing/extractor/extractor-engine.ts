import type { ExtractorStrategy } from './extractor-strategy.interface';
import { ExtractedRow } from '../interfaces/extracted-row.interface';

export class ExtractorEngine {
  private strategy: ExtractorStrategy;

  constructor(strategy: ExtractorStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: ExtractorStrategy): void {
    this.strategy = strategy;
  }

  getStrategyName(): string {
    return this.strategy.name;
  }

  async extractTables(buffer: Buffer): Promise<ExtractedRow[]> {
    return this.strategy.extractTables(buffer);
  }
}
