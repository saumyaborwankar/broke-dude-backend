import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTollCategory1780572390000 implements MigrationInterface {
  name = 'AddTollCategory1780572390000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "transactions_category_enum" ADD VALUE 'Toll'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL doesn't support removing values from enums
  }
}
