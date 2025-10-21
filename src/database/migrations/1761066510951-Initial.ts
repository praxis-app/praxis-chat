import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1761066510951 implements MigrationInterface {
  name = 'Initial1761066510951';

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
            CREATE TYPE "public"."poll_action_permission_action_enum" AS ENUM('delete', 'create', 'read', 'update', 'manage')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."poll_action_permission_subject_enum" AS ENUM(
                'ServerConfig',
                'Channel',
                'Invite',
                'Message',
                'Role',
                'all'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."poll_action_permission_changetype_enum" AS ENUM('add', 'remove')
        `);
    await queryRunner.query(`
            CREATE TABLE "poll_action_permission" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "action" "public"."poll_action_permission_action_enum" NOT NULL,
                "subject" "public"."poll_action_permission_subject_enum" NOT NULL,
                "changeType" "public"."poll_action_permission_changetype_enum" NOT NULL,
                "pollActionRoleId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_67a01570a4a264c965e8e27327b" UNIQUE ("pollActionRoleId", "action", "subject"),
                CONSTRAINT "PK_33c40531e8827e453c7cde48d9b" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."poll_action_role_member_changetype_enum" AS ENUM('add', 'remove')
        `);
    await queryRunner.query(`
            CREATE TABLE "poll_action_role_member" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "changeType" "public"."poll_action_role_member_changetype_enum" NOT NULL,
                "userId" uuid NOT NULL,
                "pollActionRoleId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_d8ba65b39b8ae603d2ca6e78ad6" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."poll_action_actiontype_enum" AS ENUM(
                'change-settings',
                'change-role',
                'create-role',
                'plan-event',
                'test'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "poll_action" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "actionType" "public"."poll_action_actiontype_enum" NOT NULL,
                "pollId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "REL_5a989cc7b2bd95f83ef2f7aa57" UNIQUE ("pollId"),
                CONSTRAINT "PK_07ff4c87300a6ff964b34218a50" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "poll_action_role" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying,
                "color" character varying,
                "prevName" character varying,
                "prevColor" character varying,
                "pollActionId" uuid NOT NULL,
                "roleId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "REL_1cd116cff0095b33272dda497d" UNIQUE ("pollActionId"),
                CONSTRAINT "PK_55056c1ab988535621bd8a11dc4" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."role_permission_action_enum" AS ENUM('delete', 'create', 'read', 'update', 'manage')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."role_permission_subject_enum" AS ENUM(
                'ServerConfig',
                'Channel',
                'Invite',
                'Message',
                'Role',
                'all'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "role_permission" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "action" "public"."role_permission_action_enum" NOT NULL,
                "subject" "public"."role_permission_subject_enum" NOT NULL,
                "roleId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_7130bd1b70d7d0b335f74e9e706" UNIQUE ("roleId", "action", "subject"),
                CONSTRAINT "PK_96c8f1fd25538d3692024115b47" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "role" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "color" character varying NOT NULL,
                "serverId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id")
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
                "serverId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "REL_9b1056350ea666ee06ff0ee42e" UNIQUE ("serverId"),
                CONSTRAINT "PK_f0bf5101843e99a758694f11417" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "server_member" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "serverId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e8cc6702fa9b108fc956af4d341" UNIQUE ("userId", "serverId"),
                CONSTRAINT "PK_310a1c369f7913dd767e58d27e6" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "server" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e16254733ff2264f94f856316ee" UNIQUE ("name"),
                CONSTRAINT "PK_f8b8af38bdc23b447c0a57c7937" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "invite" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "token" character varying NOT NULL,
                "uses" integer NOT NULL DEFAULT '0',
                "maxUses" integer,
                "userId" uuid NOT NULL,
                "serverId" uuid NOT NULL,
                "expiresAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_fc9fa190e5a3c5d80604a4f63e1" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."vote_votetype_enum" AS ENUM('agree', 'disagree', 'abstain', 'block')
        `);
    await queryRunner.query(`
            CREATE TABLE "vote" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "voteType" "public"."vote_votetype_enum" NOT NULL,
                "pollId" uuid,
                "userId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_22122c3d0f023c4d4ed37f77924" UNIQUE ("pollId", "userId"),
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
            CREATE TYPE "public"."image_imagetype_enum" AS ENUM(
                'message',
                'poll',
                'cover-photo',
                'profile-picture'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "image" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "filename" character varying,
                "imageType" "public"."image_imagetype_enum" NOT NULL,
                "messageId" uuid,
                "pollId" uuid,
                "userId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."poll_config_decisionmakingmodel_enum" AS ENUM('consent', 'consensus', 'majority-vote')
        `);
    await queryRunner.query(`
            CREATE TABLE "poll_config" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "decisionMakingModel" "public"."poll_config_decisionmakingmodel_enum" NOT NULL DEFAULT 'consensus',
                "disagreementsLimit" integer NOT NULL DEFAULT '2',
                "abstainsLimit" integer NOT NULL DEFAULT '2',
                "ratificationThreshold" integer NOT NULL DEFAULT '51',
                "closingAt" TIMESTAMP,
                "pollId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "REL_0dbe9a1c2c9dd319da85fa519f" UNIQUE ("pollId"),
                CONSTRAINT "PK_5b06d0654f0b230beb7e5716d24" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."poll_stage_enum" AS ENUM('voting', 'ratified', 'revision', 'closed')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."poll_polltype_enum" AS ENUM('proposal', 'poll')
        `);
    await queryRunner.query(`
            CREATE TABLE "poll" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "ciphertext" bytea,
                "iv" bytea,
                "tag" bytea,
                "keyId" uuid,
                "stage" "public"."poll_stage_enum" NOT NULL DEFAULT 'voting',
                "pollType" "public"."poll_polltype_enum" NOT NULL DEFAULT 'proposal',
                "userId" uuid NOT NULL,
                "channelId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_03b5cf19a7f562b231c3458527e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "channel" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "serverId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e57d07b8feec2361c589e0df7d4" UNIQUE ("serverId", "name"),
                CONSTRAINT "PK_590f33ee6ee7d76437acf362e39" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."message_commandstatus_enum" AS ENUM('processing', 'completed', 'failed')
        `);
    await queryRunner.query(`
            CREATE TABLE "message" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "ciphertext" bytea,
                "iv" bytea,
                "tag" bytea,
                "userId" uuid,
                "isBot" boolean NOT NULL DEFAULT false,
                "commandStatus" "public"."message_commandstatus_enum",
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
            ALTER TABLE "poll_action_permission"
            ADD CONSTRAINT "FK_8bb2aaec74bc9c92bdd06dafda0" FOREIGN KEY ("pollActionRoleId") REFERENCES "poll_action_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action_role_member"
            ADD CONSTRAINT "FK_17afee8069124696b9388072270" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action_role_member"
            ADD CONSTRAINT "FK_de3c3a3bb75ce77d13a670d168d" FOREIGN KEY ("pollActionRoleId") REFERENCES "poll_action_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action"
            ADD CONSTRAINT "FK_5a989cc7b2bd95f83ef2f7aa578" FOREIGN KEY ("pollId") REFERENCES "poll"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action_role"
            ADD CONSTRAINT "FK_1cd116cff0095b33272dda497de" FOREIGN KEY ("pollActionId") REFERENCES "poll_action"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action_role"
            ADD CONSTRAINT "FK_8a38eaeb6c3333208c86cd517d2" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permission"
            ADD CONSTRAINT "FK_e3130a39c1e4a740d044e685730" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "role"
            ADD CONSTRAINT "FK_d9e438d88cfb64f7f8e1ae593c3" FOREIGN KEY ("serverId") REFERENCES "server"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "server_config"
            ADD CONSTRAINT "FK_9b1056350ea666ee06ff0ee42e6" FOREIGN KEY ("serverId") REFERENCES "server"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "server_member"
            ADD CONSTRAINT "FK_f9f9c53e6768e4ad9a7092a3993" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "server_member"
            ADD CONSTRAINT "FK_57806110c6ca99dbd5e6b1dd729" FOREIGN KEY ("serverId") REFERENCES "server"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "invite"
            ADD CONSTRAINT "FK_91bfeec7a9574f458e5b592472d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "invite"
            ADD CONSTRAINT "FK_f3f0ed0097df61a45447f755402" FOREIGN KEY ("serverId") REFERENCES "server"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "vote"
            ADD CONSTRAINT "FK_3827d62f3c37dc8a63a13c4d0da" FOREIGN KEY ("pollId") REFERENCES "poll"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ADD CONSTRAINT "FK_90220bb370e4eb47037ee3c6e25" FOREIGN KEY ("pollId") REFERENCES "poll"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "image"
            ADD CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_config"
            ADD CONSTRAINT "FK_0dbe9a1c2c9dd319da85fa519ff" FOREIGN KEY ("pollId") REFERENCES "poll"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "poll"
            ADD CONSTRAINT "FK_12b7d870d12b115ba28ad815a0b" FOREIGN KEY ("keyId") REFERENCES "channel_key"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "poll"
            ADD CONSTRAINT "FK_0610ebcfcfb4a18441a9bcdab2f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "poll"
            ADD CONSTRAINT "FK_c1240fcc9675946ea5d6c2860e0" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "channel"
            ADD CONSTRAINT "FK_656efd5d40c72d70f0e63293966" FOREIGN KEY ("serverId") REFERENCES "server"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "channel" DROP CONSTRAINT "FK_656efd5d40c72d70f0e63293966"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll" DROP CONSTRAINT "FK_c1240fcc9675946ea5d6c2860e0"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll" DROP CONSTRAINT "FK_0610ebcfcfb4a18441a9bcdab2f"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll" DROP CONSTRAINT "FK_12b7d870d12b115ba28ad815a0b"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_config" DROP CONSTRAINT "FK_0dbe9a1c2c9dd319da85fa519ff"
        `);
    await queryRunner.query(`
            ALTER TABLE "image" DROP CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc"
        `);
    await queryRunner.query(`
            ALTER TABLE "image" DROP CONSTRAINT "FK_90220bb370e4eb47037ee3c6e25"
        `);
    await queryRunner.query(`
            ALTER TABLE "image" DROP CONSTRAINT "FK_f69c7f02013805481ec0edcf3ea"
        `);
    await queryRunner.query(`
            ALTER TABLE "vote" DROP CONSTRAINT "FK_f5de237a438d298031d11a57c3b"
        `);
    await queryRunner.query(`
            ALTER TABLE "vote" DROP CONSTRAINT "FK_3827d62f3c37dc8a63a13c4d0da"
        `);
    await queryRunner.query(`
            ALTER TABLE "invite" DROP CONSTRAINT "FK_f3f0ed0097df61a45447f755402"
        `);
    await queryRunner.query(`
            ALTER TABLE "invite" DROP CONSTRAINT "FK_91bfeec7a9574f458e5b592472d"
        `);
    await queryRunner.query(`
            ALTER TABLE "server_member" DROP CONSTRAINT "FK_57806110c6ca99dbd5e6b1dd729"
        `);
    await queryRunner.query(`
            ALTER TABLE "server_member" DROP CONSTRAINT "FK_f9f9c53e6768e4ad9a7092a3993"
        `);
    await queryRunner.query(`
            ALTER TABLE "server_config" DROP CONSTRAINT "FK_9b1056350ea666ee06ff0ee42e6"
        `);
    await queryRunner.query(`
            ALTER TABLE "role" DROP CONSTRAINT "FK_d9e438d88cfb64f7f8e1ae593c3"
        `);
    await queryRunner.query(`
            ALTER TABLE "role_permission" DROP CONSTRAINT "FK_e3130a39c1e4a740d044e685730"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action_role" DROP CONSTRAINT "FK_8a38eaeb6c3333208c86cd517d2"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action_role" DROP CONSTRAINT "FK_1cd116cff0095b33272dda497de"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action" DROP CONSTRAINT "FK_5a989cc7b2bd95f83ef2f7aa578"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action_role_member" DROP CONSTRAINT "FK_de3c3a3bb75ce77d13a670d168d"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action_role_member" DROP CONSTRAINT "FK_17afee8069124696b9388072270"
        `);
    await queryRunner.query(`
            ALTER TABLE "poll_action_permission" DROP CONSTRAINT "FK_8bb2aaec74bc9c92bdd06dafda0"
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
            DROP TABLE "channel_key"
        `);
    await queryRunner.query(`
            DROP TABLE "message"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."message_commandstatus_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "channel"
        `);
    await queryRunner.query(`
            DROP TABLE "poll"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."poll_polltype_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."poll_stage_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "poll_config"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."poll_config_decisionmakingmodel_enum"
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
            DROP TABLE "invite"
        `);
    await queryRunner.query(`
            DROP TABLE "server"
        `);
    await queryRunner.query(`
            DROP TABLE "server_member"
        `);
    await queryRunner.query(`
            DROP TABLE "server_config"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."server_config_decisionmakingmodel_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "role"
        `);
    await queryRunner.query(`
            DROP TABLE "role_permission"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."role_permission_subject_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."role_permission_action_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "poll_action_role"
        `);
    await queryRunner.query(`
            DROP TABLE "poll_action"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."poll_action_actiontype_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "poll_action_role_member"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."poll_action_role_member_changetype_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "poll_action_permission"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."poll_action_permission_changetype_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."poll_action_permission_subject_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."poll_action_permission_action_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "channel_member"
        `);
  }
}
