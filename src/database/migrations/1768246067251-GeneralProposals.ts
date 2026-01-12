import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneralProposals1768246067251 implements MigrationInterface {
  name = 'GeneralProposals1768246067251';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TYPE "public"."poll_action_actiontype_enum"
            RENAME TO "poll_action_actiontype_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."poll_action_actiontype_enum" AS ENUM(
                'general',
                'change-settings',
                'change-role',
                'create-role',
                'plan-event',
                'test'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action"
            ALTER COLUMN "actionType" TYPE "public"."poll_action_actiontype_enum" USING "actionType"::"text"::"public"."poll_action_actiontype_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."poll_action_actiontype_enum_old"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."poll_action_actiontype_enum_old" AS ENUM(
                'change-settings',
                'change-role',
                'create-role',
                'plan-event',
                'test'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action"
            ALTER COLUMN "actionType" TYPE "public"."poll_action_actiontype_enum_old" USING "actionType"::"text"::"public"."poll_action_actiontype_enum_old"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."poll_action_actiontype_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."poll_action_actiontype_enum_old"
            RENAME TO "poll_action_actiontype_enum"
        `);
  }
}
