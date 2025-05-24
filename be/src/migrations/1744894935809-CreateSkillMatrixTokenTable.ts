import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSkillMatrixTokenTable1744894935809 implements MigrationInterface {
    name = 'CreateSkillMatrixTokenTable1744894935809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`skill_matrix_token\` (\`id\` varchar(36) NOT NULL, \`token\` varchar(255) NOT NULL, \`expiresAt\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`roleId\` varchar(36) NULL, \`designationId\` varchar(36) NULL, UNIQUE INDEX \`IDX_0bfa9ea5b31148c5eb05e14231\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix_token\` ADD CONSTRAINT \`FK_86e78c0f5b47fb3f0da3374cf48\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix_token\` ADD CONSTRAINT \`FK_49a07c69c9a0dbb2f9b8da9cfa6\` FOREIGN KEY (\`designationId\`) REFERENCES \`designation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`skill_matrix_token\` DROP FOREIGN KEY \`FK_49a07c69c9a0dbb2f9b8da9cfa6\``);
        await queryRunner.query(`ALTER TABLE \`skill_matrix_token\` DROP FOREIGN KEY \`FK_86e78c0f5b47fb3f0da3374cf48\``);
        await queryRunner.query(`DROP INDEX \`IDX_0bfa9ea5b31148c5eb05e14231\` ON \`skill_matrix_token\``);
        await queryRunner.query(`DROP TABLE \`skill_matrix_token\``);
    }

}
