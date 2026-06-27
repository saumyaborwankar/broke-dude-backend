import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParkingCategory1780572391000 implements MigrationInterface {
  name = 'AddParkingCategory1780572391000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "transactions_category_enum" ADD VALUE 'parking'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
