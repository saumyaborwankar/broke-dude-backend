import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Transaction, TransactionSource } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create(dto);
    return this.transactionRepository.save(transaction);
  }

  async findDuplicate(
    description: string,
    amount: number,
    date: string,
    source: TransactionSource,
  ): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { description, amount, date, source },
    });
  }

  async findAll(filters?: {
    startDate?: string;
    endDate?: string;
    source?: string;
  }): Promise<Transaction[]> {
    const where: any = {};

    if (filters?.startDate && filters?.endDate) {
      where.date = Between(filters.startDate, filters.endDate);
    } else if (filters?.startDate) {
      where.date = MoreThanOrEqual(filters.startDate);
    } else if (filters?.endDate) {
      where.date = LessThanOrEqual(filters.endDate);
    }

    if (filters?.source) {
      where.source = filters.source;
    }

    return this.transactionRepository.find({
      where,
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }
    return transaction;
  }

  async update(id: string, dto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(id);
    Object.assign(transaction, dto);
    return this.transactionRepository.save(transaction);
  }

  async remove(id: string): Promise<void> {
    const transaction = await this.findOne(id);
    await this.transactionRepository.remove(transaction);
  }
}
