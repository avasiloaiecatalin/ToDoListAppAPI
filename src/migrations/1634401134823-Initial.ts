import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1634401134823 implements MigrationInterface {
    name = 'Initial1634401134823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`isActivated\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`todo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`creatorId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_action\` (\`id\` int NOT NULL AUTO_INCREMENT, \`activateAccount\` varchar(255) NULL, \`changePassword\` varchar(255) NULL, \`changeEmail\` varchar(255) NULL, \`userId\` int NULL, UNIQUE INDEX \`REL_c025478b45e60017ed10c77f99\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`todo\` ADD CONSTRAINT \`FK_a4bb15f5b622b108dd0bc9d248d\` FOREIGN KEY (\`creatorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_action\` ADD CONSTRAINT \`FK_c025478b45e60017ed10c77f99c\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_action\` DROP FOREIGN KEY \`FK_c025478b45e60017ed10c77f99c\``);
        await queryRunner.query(`ALTER TABLE \`todo\` DROP FOREIGN KEY \`FK_a4bb15f5b622b108dd0bc9d248d\``);
        await queryRunner.query(`DROP INDEX \`REL_c025478b45e60017ed10c77f99\` ON \`user_action\``);
        await queryRunner.query(`DROP TABLE \`user_action\``);
        await queryRunner.query(`DROP TABLE \`todo\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
