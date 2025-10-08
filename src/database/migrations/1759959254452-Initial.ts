import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1759959254452 implements MigrationInterface {
  name = 'Initial1759959254452';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "channel_member" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "lastMessageReadId" uuid,
                "userId" uuid NOT NULL,
                "channelId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_f6fbde8772b051e6ef433f890cd" UNIQUE ("userId", "channelId"),
                CONSTRAINT "PK_a4a716289e5b0468f55f8e8d225" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "invite" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "token" character varying NOT NULL,
                "uses" integer NOT NULL DEFAULT '0',
                "maxUses" integer,
                "userId" uuid NOT NULL,
                "expiresAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_fc9fa190e5a3c5d80604a4f63e1" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."permission_action_enum" AS ENUM('delete', 'create', 'read', 'update', 'manage')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."permission_subject_enum" AS ENUM(
                'ServerConfig',
                'Channel',
                'Invite',
                'Message',
                'Role',
                'all'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "permission" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "action" "public"."permission_action_enum" NOT NULL,
                "subject" "public"."permission_subject_enum" NOT NULL,
                "roleId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_f81e83ebc05e9a49e8ab5a2303d" UNIQUE ("roleId", "action", "subject"),
                CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "role" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "color" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id")
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
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "displayName" character varying,
                "email" character varying,
                "password" character varying,
                "bio" character varying,
                "anonymous" boolean NOT NULL DEFAULT false,
                "locked" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_065d4d8f3b5adb4a08841eae3c8" UNIQUE ("name"),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "valid_name_check" CHECK ("name" ~ '^[a-z0-9_]+$'),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."image_imagetype_enum" AS ENUM('message', 'cover-photo', 'profile-picture')
        `);
    await queryRunner.query(`
            CREATE TABLE "image" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "filename" character varying,
                "imageType" "public"."image_imagetype_enum" NOT NULL,
                "messageId" uuid,
                "proposalId" uuid,
                "userId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id")
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
                "ciphertext" bytea,
                "iv" bytea,
                "tag" bytea,
                "keyId" uuid,
                "stage" "public"."proposal_stage_enum" NOT NULL DEFAULT 'voting',
                "userId" uuid NOT NULL,
                "channelId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ca872ecfe4fef5720d2d39e4275" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "channel" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_590f33ee6ee7d76437acf362e39" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "message" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "ciphertext" bytea,
                "iv" bytea,
                "tag" bytea,
                "userId" uuid NOT NULL,
                "keyId" uuid,
                "channelId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "channel_key" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "wrappedKey" bytea NOT NULL,
                "iv" bytea NOT NULL,
                "tag" bytea NOT NULL,
                "channelId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ea63adc254fc8f8e5b404965d32" PRIMARY KEY ("id")
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
            CREATE TABLE "role_members_user" (
                "roleId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_b47ecc28f78e95361c666b11fa8" PRIMARY KEY ("roleId", "userId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_bc4c45c917cd69cef0574dc3c0" ON "role_members_user" ("roleId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_8ebd83d04eb1d0270c6e1d9d62" ON "role_members_user" ("userId")
        `);
    await queryRunner.query(`
            ALTER TABLE "channel_member"
            ADD CONSTRAINT "FK_245da03cfde01c653c492d83a0d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "channel_member"
            ADD CONSTRAINT "FK_01ae975cf03c76e7ebfb14f22f0" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "invite"
            ADD CONSTRAINT "FK_91bfeec7a9574f458e5b592472d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "permission"
            ADD CONSTRAINT "FK_cdb4db95384a1cf7a837c4c683e" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "proposal_action_permission"
            ADD CONSTRAINT "FK_d30bc47f532c1ee16830ef03d44" FOREIGN KEY ("proposalActionRoleId") REFERENCES "proposal_action_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "proposal_action"
            ADD CONSTRAINT "FK_542f653febd92b2a0d67dcadb05" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "image"
            ADD CONSTRAINT "FK_f69c7f02013805481ec0edcf3ea" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "image"
            ADD CONSTRAINT "FK_335251c897e637fa2a83597f263" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "image"
            ADD CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "proposal_config"
            ADD CONSTRAINT "FK_9b5d32fef3ec87bf111c964f2cf" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "proposal"
            ADD CONSTRAINT "FK_a3154e9996ebe9681116340c6ba" FOREIGN KEY ("keyId") REFERENCES "channel_key"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "message"
            ADD CONSTRAINT "FK_446251f8ceb2132af01b68eb593" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "message"
            ADD CONSTRAINT "FK_ac10a4ed1d76c25807d10b2b334" FOREIGN KEY ("keyId") REFERENCES "channel_key"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "message"
            ADD CONSTRAINT "FK_5fdbbcb32afcea663c2bea2954f" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "channel_key"
            ADD CONSTRAINT "FK_00c23051eef6abf60bf73673e2b" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "role_members_user"
            ADD CONSTRAINT "FK_bc4c45c917cd69cef0574dc3c0a" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "role_members_user"
            ADD CONSTRAINT "FK_8ebd83d04eb1d0270c6e1d9d620" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "role_members_user" DROP CONSTRAINT "FK_8ebd83d04eb1d0270c6e1d9d620"
        `);
    await queryRunner.query(`
            ALTER TABLE "role_members_user" DROP CONSTRAINT "FK_bc4c45c917cd69cef0574dc3c0a"
        `);
    await queryRunner.query(`
            ALTER TABLE "channel_key" DROP CONSTRAINT "FK_00c23051eef6abf60bf73673e2b"
        `);
    await queryRunner.query(`
            ALTER TABLE "message" DROP CONSTRAINT "FK_5fdbbcb32afcea663c2bea2954f"
        `);
    await queryRunner.query(`
            ALTER TABLE "message" DROP CONSTRAINT "FK_ac10a4ed1d76c25807d10b2b334"
        `);
    await queryRunner.query(`
            ALTER TABLE "message" DROP CONSTRAINT "FK_446251f8ceb2132af01b68eb593"
        `);
    await queryRunner.query(`
            ALTER TABLE "proposal" DROP CONSTRAINT "FK_a6bf88300c559bee3dfdb78c022"
        `);
    await queryRunner.query(`
            ALTER TABLE "proposal" DROP CONSTRAINT "FK_de14a768fe600bb1e723b32377e"
        `);
    await queryRunner.query(`
            ALTER TABLE "proposal" DROP CONSTRAINT "FK_a3154e9996ebe9681116340c6ba"
        `);
    await queryRunner.query(`
            ALTER TABLE "proposal_config" DROP CONSTRAINT "FK_9b5d32fef3ec87bf111c964f2cf"
        `);
    await queryRunner.query(`
            ALTER TABLE "image" DROP CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc"
        `);
    await queryRunner.query(`
            ALTER TABLE "image" DROP CONSTRAINT "FK_335251c897e637fa2a83597f263"
        `);
    await queryRunner.query(`
            ALTER TABLE "image" DROP CONSTRAINT "FK_f69c7f02013805481ec0edcf3ea"
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
            ALTER TABLE "proposal_action_role" DROP CONSTRAINT "FK_a5582c00ad2e43a5391f6cdb97b"
        `);
    await queryRunner.query(`
            ALTER TABLE "proposal_action_role" DROP CONSTRAINT "FK_81a331d1f0e93a0eaac9585cb7c"
        `);
    await queryRunner.query(`
            ALTER TABLE "proposal_action" DROP CONSTRAINT "FK_542f653febd92b2a0d67dcadb05"
        `);
    await queryRunner.query(`
            ALTER TABLE "proposal_action_permission" DROP CONSTRAINT "FK_d30bc47f532c1ee16830ef03d44"
        `);
    await queryRunner.query(`
            ALTER TABLE "permission" DROP CONSTRAINT "FK_cdb4db95384a1cf7a837c4c683e"
        `);
    await queryRunner.query(`
            ALTER TABLE "invite" DROP CONSTRAINT "FK_91bfeec7a9574f458e5b592472d"
        `);
    await queryRunner.query(`
            ALTER TABLE "channel_member" DROP CONSTRAINT "FK_01ae975cf03c76e7ebfb14f22f0"
        `);
    await queryRunner.query(`
            ALTER TABLE "channel_member" DROP CONSTRAINT "FK_245da03cfde01c653c492d83a0d"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_8ebd83d04eb1d0270c6e1d9d62"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_bc4c45c917cd69cef0574dc3c0"
        `);
    await queryRunner.query(`
            DROP TABLE "role_members_user"
        `);
    await queryRunner.query(`
            DROP TABLE "server_config"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."server_config_decisionmakingmodel_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "channel_key"
        `);
    await queryRunner.query(`
            DROP TABLE "message"
        `);
    await queryRunner.query(`
            DROP TABLE "channel"
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
            DROP TABLE "image"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."image_imagetype_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "user"
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
    await queryRunner.query(`
            DROP TABLE "proposal_action_role"
        `);
    await queryRunner.query(`
            DROP TABLE "proposal_action"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."proposal_action_actiontype_enum"
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
            DROP TABLE "role"
        `);
    await queryRunner.query(`
            DROP TABLE "permission"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."permission_subject_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."permission_action_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "invite"
        `);
    await queryRunner.query(`
            DROP TABLE "channel_member"
        `);
  }
}
