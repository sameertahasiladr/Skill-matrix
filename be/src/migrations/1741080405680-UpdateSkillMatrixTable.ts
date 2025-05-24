import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSkillMatrixTable1741080405680 implements MigrationInterface {
    name = 'UpdateSkillMatrixTable1741080405680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable('skills', 'skill_matrix');
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` DROP FOREIGN KEY \`FK_f01abbc71d9bd92e5e87db88c05\``);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` DROP COLUMN \`master_id\``);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` MODIFY COLUMN \`example\` text`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` MODIFY COLUMN \`responsibilities\` text`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` MODIFY COLUMN \`description\` varchar(1000)`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` MODIFY COLUMN \`skills\` varchar(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` MODIFY COLUMN \`example\` varchar(255)`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` MODIFY COLUMN \`responsibilities\` varchar(255)`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` MODIFY COLUMN \`description\` varchar(255)`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` MODIFY COLUMN \`skills\` varchar(255)`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` ADD \`master_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` ADD CONSTRAINT \`FK_f01abbc71d9bd92e5e87db88c05\` FOREIGN KEY (\`master_id\`) REFERENCES \`legend\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.renameTable('skill_matrix', 'skills');

    }

}
