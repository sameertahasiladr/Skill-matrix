import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTable1741593554908 implements MigrationInterface {
    name = 'UpdateUserTable1741593554908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_0f4e0316052db319b0e7e973e9\` ON \`user\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`signup_status\` \`signup_status\` varchar(255) NOT NULL DEFAULT 'Inactive'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`signup_status\` \`signup_status\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_0f4e0316052db319b0e7e973e9\` ON \`user\` (\`emp_id\`)`);
    }

}
