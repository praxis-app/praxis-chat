import { MigrationInterface, QueryRunner } from 'typeorm';

export class Quorum1768765275954 implements MigrationInterface {
  name = 'Quorum1768765275954';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "server_config" DROP COLUMN "ratificationThreshold"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_config" DROP COLUMN "ratificationThreshold"
        `);
    await queryRunner.query(`
            ALTER TABLE "server_config"
            ADD "agreementThreshold" integer NOT NULL DEFAULT '51'
        `);
    await queryRunner.query(`
            ALTER TABLE "server_config"
            ADD "quorumEnabled" boolean NOT NULL DEFAULT true
        `);
    await queryRunner.query(`
            ALTER TABLE "server_config"
            ADD "quorumThreshold" integer NOT NULL DEFAULT '51'
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_config"
            ADD "agreementThreshold" integer NOT NULL DEFAULT '51'
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_config"
            ADD "quorumEnabled" boolean NOT NULL DEFAULT true
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_config"
            ADD "quorumThreshold" integer NOT NULL DEFAULT '51'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "poll_config" DROP COLUMN "quorumThreshold"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_config" DROP COLUMN "quorumEnabled"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_config" DROP COLUMN "agreementThreshold"
        `);
    await queryRunner.query(`
            ALTER TABLE "server_config" DROP COLUMN "quorumThreshold"
        `);
    await queryRunner.query(`
            ALTER TABLE "server_config" DROP COLUMN "quorumEnabled"
        `);
    await queryRunner.query(`
            ALTER TABLE "server_config" DROP COLUMN "agreementThreshold"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_config"
            ADD "ratificationThreshold" integer NOT NULL DEFAULT '51'
        `);
    await queryRunner.query(`
            ALTER TABLE "server_config"
            ADD "ratificationThreshold" integer NOT NULL DEFAULT '51'
        `);
  }
}
