import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateJobTable1741329807321 implements MigrationInterface {
    name = 'UpdateJobTable1741329807321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`filePath\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` CHANGE \`skills\` \`skills\` varchar(500) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` CHANGE \`skills\` \`skills\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`filePath\``);
    }

}
