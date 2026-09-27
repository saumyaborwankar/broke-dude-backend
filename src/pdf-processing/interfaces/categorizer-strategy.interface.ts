import {
  TransactionCategory,
  TransactionSubcategory,
} from '../../transactions/transaction.entity';

export interface CategorizationResult {
  category: TransactionCategory;
  confidence: number;
  subcategory?: TransactionSubcategory;
  notes?: string;
}

export interface CategorizerStrategy {
  categorize(description: string, amount: number): CategorizationResult;
  name: string;
}
