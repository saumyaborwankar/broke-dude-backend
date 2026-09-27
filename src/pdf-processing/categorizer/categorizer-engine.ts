import type {
  CategorizerStrategy,
  CategorizationResult,
} from '../interfaces/categorizer-strategy.interface';

export class CategorizerEngine {
  private strategy: CategorizerStrategy;

  constructor(strategy: CategorizerStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: CategorizerStrategy): void {
    this.strategy = strategy;
  }

  getStrategyName(): string {
    return this.strategy.name;
  }

  categorize(description: string, amount: number): CategorizationResult {
    return this.strategy.categorize(description, amount);
  }

  categorizeBatch(
    rows: { description: string; amount: number }[],
  ): Array<{ description: string; amount: number } & CategorizationResult> {
    return rows.map((row) => {
      const result = this.categorize(row.description, row.amount);
      return { ...row, ...result };
    });
  }
}
