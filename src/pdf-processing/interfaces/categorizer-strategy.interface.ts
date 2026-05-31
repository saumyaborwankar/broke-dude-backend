import { TransactionCategory } from '../../transactions/transaction.entity';

export interface CategorizationResult {
  category: TransactionCategory;
  confidence: number;
}

export interface CategorizerStrategy {
  categorize(description: string, amount: number): CategorizationResult;
  name: string;
}
