import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyTransactions1780245285390 implements MigrationInterface {
    name = 'ModifyTransactions1780245285390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "subcategory" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "subcategory" SET NOT NULL`);
    }

}
