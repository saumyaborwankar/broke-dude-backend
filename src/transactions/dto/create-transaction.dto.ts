import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';
import {
  TransactionCategory,
  TransactionSubcategory,
  TransactionSource,
} from '../transaction.entity';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @IsEnum(TransactionCategory)
  @IsNotEmpty()
  category!: TransactionCategory;

  @IsEnum(TransactionSubcategory)
  @IsOptional()
  subcategory?: TransactionSubcategory;

  @IsEnum(TransactionSource)
  @IsNotEmpty()
  source!: TransactionSource;

  @IsString()
  @IsOptional()
  notes?: string;
}
