import { MigrationInterface, QueryRunner } from "typeorm";

export class RoleChangeProposals1758399488130 implements MigrationInterface {
    name = 'RoleChangeProposals1758399488130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."proposal_action_role_member_changetype_enum" AS ENUM('add', 'remove')
        `);
        await queryRunner.query(`
            CREATE TABLE "proposal_action_role_member" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "changeType" "public"."proposal_action_role_member_changetype_enum" NOT NULL,
                "userId" uuid NOT NULL,
                "proposalActionRoleId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_9daabc8eb1cb4a3bc1681773c84" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."vote_votetype_enum" AS ENUM('agree', 'disagree', 'abstain', 'block')
        `);
        await queryRunner.query(`
            CREATE TABLE "vote" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "voteType" "public"."vote_votetype_enum" NOT NULL,
                "proposalId" uuid,
                "userId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."proposal_action_permission_action_enum" AS ENUM('delete', 'create', 'read', 'update', 'manage')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."proposal_action_permission_subject_enum" AS ENUM(
                'ServerConfig',
                'Channel',
                'Invite',
                'Message',
                'Role',
                'all'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."proposal_action_permission_changetype_enum" AS ENUM('add', 'remove')
        `);
        await queryRunner.query(`
            CREATE TABLE "proposal_action_permission" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "action" "public"."proposal_action_permission_action_enum" NOT NULL,
                "subject" "public"."proposal_action_permission_subject_enum" NOT NULL,
                "changeType" "public"."proposal_action_permission_changetype_enum" NOT NULL,
                "proposalActionRoleId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_4517bf4c56d391ada8bb64f87de" UNIQUE ("proposalActionRoleId", "action", "subject"),
                CONSTRAINT "PK_da6266a8417a739330b77007faa" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "proposal_action_role" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying,
                "color" character varying,
                "prevName" character varying,
                "prevColor" character varying,
                "proposalActionId" uuid NOT NULL,
                "roleId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "REL_81a331d1f0e93a0eaac9585cb7" UNIQUE ("proposalActionId"),
                CONSTRAINT "PK_0a14dd2782594c498b221ccf557" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."proposal_action_actiontype_enum" AS ENUM(
                'change-settings',
                'change-role',
                'create-role',
                'plan-event',
                'test'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "proposal_action" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "actionType" "public"."proposal_action_actiontype_enum" NOT NULL,
                "proposalId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "REL_542f653febd92b2a0d67dcadb0" UNIQUE ("proposalId"),
                CONSTRAINT "PK_c44bd6250cf241ddd15782e8b55" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."proposal_config_decisionmakingmodel_enum" AS ENUM('consent', 'consensus', 'majority-vote')
        `);
        await queryRunner.query(`
            CREATE TABLE "proposal_config" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "decisionMakingModel" "public"."proposal_config_decisionmakingmodel_enum" NOT NULL DEFAULT 'consensus',
                "disagreementsLimit" integer NOT NULL DEFAULT '2',
                "abstainsLimit" integer NOT NULL DEFAULT '2',
                "ratificationThreshold" integer NOT NULL DEFAULT '51',
                "closingAt" TIMESTAMP,
                "proposalId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "REL_9b5d32fef3ec87bf111c964f2c" UNIQUE ("proposalId"),
                CONSTRAINT "PK_2f0858babf4bb7af66b142b83f8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."proposal_stage_enum" AS ENUM('voting', 'ratified', 'revision', 'closed')
        `);
        await queryRunner.query(`
            CREATE TABLE "proposal" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "body" character varying,
                "stage" "public"."proposal_stage_enum" NOT NULL DEFAULT 'voting',
                "userId" uuid NOT NULL,
                "channelId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ca872ecfe4fef5720d2d39e4275" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."server_config_decisionmakingmodel_enum" AS ENUM('consent', 'consensus', 'majority-vote')
        `);
        await queryRunner.query(`
            CREATE TABLE "server_config" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "decisionMakingModel" "public"."server_config_decisionmakingmodel_enum" NOT NULL DEFAULT 'consensus',
                "disagreementsLimit" integer NOT NULL DEFAULT '2',
                "abstainsLimit" integer NOT NULL DEFAULT '2',
                "ratificationThreshold" integer NOT NULL DEFAULT '51',
                "votingTimeLimit" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_f0bf5101843e99a758694f11417" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "image"
            ADD "proposalId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "channel_member" DROP COLUMN "lastMessageReadId"
        `);
        await queryRunner.query(`
            ALTER TABLE "channel_member"
            ADD "lastMessageReadId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_action_role_member"
            ADD CONSTRAINT "FK_5d535c7141b832cc7213a29b97a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_action_role_member"
            ADD CONSTRAINT "FK_90dfd2320379570d63cb82bd615" FOREIGN KEY ("proposalActionRoleId") REFERENCES "proposal_action_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "vote"
            ADD CONSTRAINT "FK_a6099cc53a32762d8c69e71dcd1" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "vote"
            ADD CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_action_permission"
            ADD CONSTRAINT "FK_d30bc47f532c1ee16830ef03d44" FOREIGN KEY ("proposalActionRoleId") REFERENCES "proposal_action_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_action_role"
            ADD CONSTRAINT "FK_81a331d1f0e93a0eaac9585cb7c" FOREIGN KEY ("proposalActionId") REFERENCES "proposal_action"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_action_role"
            ADD CONSTRAINT "FK_a5582c00ad2e43a5391f6cdb97b" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_action"
            ADD CONSTRAINT "FK_542f653febd92b2a0d67dcadb05" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_config"
            ADD CONSTRAINT "FK_9b5d32fef3ec87bf111c964f2cf" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal"
            ADD CONSTRAINT "FK_de14a768fe600bb1e723b32377e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal"
            ADD CONSTRAINT "FK_a6bf88300c559bee3dfdb78c022" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "image"
            ADD CONSTRAINT "FK_335251c897e637fa2a83597f263" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "image" DROP CONSTRAINT "FK_335251c897e637fa2a83597f263"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal" DROP CONSTRAINT "FK_a6bf88300c559bee3dfdb78c022"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal" DROP CONSTRAINT "FK_de14a768fe600bb1e723b32377e"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_config" DROP CONSTRAINT "FK_9b5d32fef3ec87bf111c964f2cf"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_action" DROP CONSTRAINT "FK_542f653febd92b2a0d67dcadb05"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_action_role" DROP CONSTRAINT "FK_a5582c00ad2e43a5391f6cdb97b"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_action_role" DROP CONSTRAINT "FK_81a331d1f0e93a0eaac9585cb7c"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_action_permission" DROP CONSTRAINT "FK_d30bc47f532c1ee16830ef03d44"
        `);
        await queryRunner.query(`
            ALTER TABLE "vote" DROP CONSTRAINT "FK_f5de237a438d298031d11a57c3b"
        `);
        await queryRunner.query(`
            ALTER TABLE "vote" DROP CONSTRAINT "FK_a6099cc53a32762d8c69e71dcd1"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_action_role_member" DROP CONSTRAINT "FK_90dfd2320379570d63cb82bd615"
        `);
        await queryRunner.query(`
            ALTER TABLE "proposal_action_role_member" DROP CONSTRAINT "FK_5d535c7141b832cc7213a29b97a"
        `);
        await queryRunner.query(`
            ALTER TABLE "channel_member" DROP COLUMN "lastMessageReadId"
        `);
        await queryRunner.query(`
            ALTER TABLE "channel_member"
            ADD "lastMessageReadId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "image" DROP COLUMN "proposalId"
        `);
        await queryRunner.query(`
            DROP TABLE "server_config"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."server_config_decisionmakingmodel_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "proposal"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."proposal_stage_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "proposal_config"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."proposal_config_decisionmakingmodel_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "proposal_action"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."proposal_action_actiontype_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "proposal_action_role"
        `);
        await queryRunner.query(`
            DROP TABLE "proposal_action_permission"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."proposal_action_permission_changetype_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."proposal_action_permission_subject_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."proposal_action_permission_action_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "vote"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."vote_votetype_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "proposal_action_role_member"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."proposal_action_role_member_changetype_enum"
        `);
    }

}
