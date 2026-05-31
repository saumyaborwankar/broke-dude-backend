import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionTable1780174460992 implements MigrationInterface {
  name = 'CreateTransactionTable1780174460992';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_category_enum" AS ENUM('rent', 'Shopping', 'trip', 'grocery', 'uber', 'eating out', 'phone bill', 'wifi', 'subscription', 'electricity', 'gas', 'personal', 'transit', 'one time', 'gift', 'w Raima', 'Doctor', 'Car', 'Gas')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_subcategory_enum" AS ENUM('Eating out', 'Experience', 'Grocery', 'Uber', 'Flight', 'Transit', 'Other', 'Souvenir')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_source_enum" AS ENUM('Chase CC', 'Chase checking', 'Amazon Card', 'Robinhood', 'Bilt', 'Discover', 'Apple')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text NOT NULL, "amount" numeric(10,2) NOT NULL, "date" date NOT NULL, "category" "public"."transactions_category_enum" NOT NULL, "subcategory" "public"."transactions_subcategory_enum" NOT NULL, "source" "public"."transactions_source_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_source_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."transactions_subcategory_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."transactions_category_enum"`);
  }
}
