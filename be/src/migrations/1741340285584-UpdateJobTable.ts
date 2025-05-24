import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateJobTable1741340285584 implements MigrationInterface {
    name = 'UpdateJobTable1741340285584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`uploadSummary\``);
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`uploadSummary\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`uploadSummary\``);
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`uploadSummary\` varchar(255) NULL`);
    }

}
