import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotesToTransactions1780572389000 implements MigrationInterface {
  name = 'AddNotesToTransactions1780572389000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "notes" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "notes"`,
    );
  }
}
