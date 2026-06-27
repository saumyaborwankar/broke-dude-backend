import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifySubcategory1780250802223 implements MigrationInterface {
    name = 'ModifySubcategory1780250802223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."transactions_subcategory_enum" ADD VALUE 'Shopping'`);
        await queryRunner.query(`ALTER TYPE "public"."transactions_subcategory_enum" ADD VALUE 'laundry'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_subcategory_enum_old" AS ENUM('Eating out', 'Experience', 'Grocery', 'Uber', 'Flight', 'Transit', 'Other', 'Souvenir')`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "subcategory" TYPE "public"."transactions_subcategory_enum_old" USING "subcategory"::"text"::"public"."transactions_subcategory_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_subcategory_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."transactions_subcategory_enum_old" RENAME TO "transactions_subcategory_enum"`);
    }

}
