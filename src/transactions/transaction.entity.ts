import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionCategory {
  RENT = 'rent',
  SHOPPING = 'Shopping',
  TRIP = 'trip',
  GROCERY = 'grocery',
  UBER = 'uber',
  EATING_OUT = 'eating out',
  PHONE_BILL = 'phone bill',
  WIFI = 'wifi',
  SUBSCRIPTION = 'subscription',
  ELECTRICITY = 'electricity',
  GAS = 'gas',
  PERSONAL = 'personal',
  TRANSIT = 'transit',
  ONE_TIME = 'one time',
  GIFT = 'gift',
  W_RAIMA = 'w Raima',
  DOCTOR = 'Doctor',
  CAR = 'Car',
  GAS_UTILITY = 'Gas',
}

export enum TransactionSubcategory {
  EATING_OUT = 'Eating out',
  EXPERIENCE = 'Experience',
  GROCERY = 'Grocery',
  UBER = 'Uber',
  FLIGHT = 'Flight',
  TRANSIT = 'Transit',
  OTHER = 'Other',
  SOUVENIR = 'Souvenir',
}

export enum TransactionSource {
  CHASE_CC = 'Chase CC',
  CHASE_CHECKING = 'Chase checking',
  AMAZON_CARD = 'Amazon Card',
  ROBINHOOD = 'Robinhood',
  BILT = 'Bilt',
  DISCOVER = 'Discover',
  APPLE = 'Apple',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({
    type: 'enum',
    enum: TransactionCategory,
  })
  category!: TransactionCategory;

  @Column({
    type: 'enum',
    enum: TransactionSubcategory,
  })
  subcategory!: TransactionSubcategory;

  @Column({
    type: 'enum',
    enum: TransactionSource,
  })
  source!: TransactionSource;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
