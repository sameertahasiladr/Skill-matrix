import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSkillMatrixTable1741852015658 implements MigrationInterface {
    name = 'UpdateSkillMatrixTable1741852015658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` ADD \`orderNo\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` ADD \`isVisible\` tinyint NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` DROP COLUMN \`isVisible\``);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` DROP COLUMN \`orderNo\``);
    }

}
