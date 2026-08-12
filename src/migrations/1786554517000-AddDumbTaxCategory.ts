import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDumbTaxCategory1786554517000 implements MigrationInterface {
  name = 'AddDumbTaxCategory1786554517000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "transactions_category_enum" ADD VALUE 'dumb tax'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL doesn't support removing values from enums
  }
}
