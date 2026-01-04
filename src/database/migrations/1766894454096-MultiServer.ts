import { MigrationInterface, QueryRunner } from 'typeorm';

export class MultiServer1766894454096 implements MigrationInterface {
  name = 'MultiServer1766894454096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."instance_role_permission_action_enum" AS ENUM('delete', 'create', 'read', 'update', 'manage')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."instance_role_permission_subject_enum" AS ENUM(
                'InstanceConfig',
                'InstanceRole',
                'Server',
                'all'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "instance_role_permission" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "action" "public"."instance_role_permission_action_enum" NOT NULL,
                "subject" "public"."instance_role_permission_subject_enum" NOT NULL,
                "instanceRoleId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_ca983491f05a7247445de67c0c0" UNIQUE ("instanceRoleId", "action", "subject"),
                CONSTRAINT "PK_638d8d24f4ede6687f094e12958" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "instance_role" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "color" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_669d6a4c06fce95bd298cb50232" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "instance_config" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "defaultServerId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "REL_df3cdea0f239a5c257b7e2705e" UNIQUE ("defaultServerId"),
                CONSTRAINT "PK_5d2e3165c54efdb66d16bb07e47" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "instance_role_members_user" (
                "instanceRoleId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_fa205ce493e470e66cb30c3fd96" PRIMARY KEY ("instanceRoleId", "userId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_23a6d7cb8bd31c05d7666f35a1" ON "instance_role_members_user" ("instanceRoleId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_179ce8019483c8171cdc1a0f74" ON "instance_role_members_user" ("userId")
        `);
    await queryRunner.query(`
            ALTER TABLE "server_member"
            ADD "lastActiveAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "server_config"
            ADD "anonymousUsersEnabled" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "server"
            ADD "slug" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "server"
            ADD CONSTRAINT "UQ_6de32126ad3add731de311e3f76" UNIQUE ("slug")
        `);
    await queryRunner.query(`
            ALTER TABLE "instance_role_permission"
            ADD CONSTRAINT "FK_93d704787a503d7020e00c9fe0b" FOREIGN KEY ("instanceRoleId") REFERENCES "instance_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "instance_config"
            ADD CONSTRAINT "FK_df3cdea0f239a5c257b7e2705ed" FOREIGN KEY ("defaultServerId") REFERENCES "server"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "instance_role_members_user"
            ADD CONSTRAINT "FK_23a6d7cb8bd31c05d7666f35a11" FOREIGN KEY ("instanceRoleId") REFERENCES "instance_role"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "instance_role_members_user"
            ADD CONSTRAINT "FK_179ce8019483c8171cdc1a0f743" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "instance_role_members_user" DROP CONSTRAINT "FK_179ce8019483c8171cdc1a0f743"
        `);
    await queryRunner.query(`
            ALTER TABLE "instance_role_members_user" DROP CONSTRAINT "FK_23a6d7cb8bd31c05d7666f35a11"
        `);
    await queryRunner.query(`
            ALTER TABLE "instance_config" DROP CONSTRAINT "FK_df3cdea0f239a5c257b7e2705ed"
        `);
    await queryRunner.query(`
            ALTER TABLE "instance_role_permission" DROP CONSTRAINT "FK_93d704787a503d7020e00c9fe0b"
        `);
    await queryRunner.query(`
            ALTER TABLE "server" DROP CONSTRAINT "UQ_6de32126ad3add731de311e3f76"
        `);
    await queryRunner.query(`
            ALTER TABLE "server" DROP COLUMN "slug"
        `);
    await queryRunner.query(`
            ALTER TABLE "server_config" DROP COLUMN "anonymousUsersEnabled"
        `);
    await queryRunner.query(`
            ALTER TABLE "server_member" DROP COLUMN "lastActiveAt"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_179ce8019483c8171cdc1a0f74"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_23a6d7cb8bd31c05d7666f35a1"
        `);
    await queryRunner.query(`
            DROP TABLE "instance_role_members_user"
        `);
    await queryRunner.query(`
            DROP TABLE "instance_config"
        `);
    await queryRunner.query(`
            DROP TABLE "instance_role"
        `);
    await queryRunner.query(`
            DROP TABLE "instance_role_permission"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."instance_role_permission_subject_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."instance_role_permission_action_enum"
        `);
  }
}
