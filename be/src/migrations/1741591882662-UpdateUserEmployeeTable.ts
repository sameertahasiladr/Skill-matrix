import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEmployeeTable1741591882662 implements MigrationInterface {
    name = 'UpdateUserEmployeeTable1741591882662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` DROP FOREIGN KEY \`FK_f4b0d329c4a3cf79ffe9d565047\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_f2578043e491921209f5dadd08\` ON \`user\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`phoneNumber\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`emp_email\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`emp_status\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`emp_email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_a361c74bd137e47786468113e0\` (\`emp_email\`)`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`cci_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`signup_status\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`emp_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_0f4e0316052db319b0e7e973e9\` (\`emp_id\`)`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`employment_status\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`user_group\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`user_group\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_0f4e0316052db319b0e7e973e9\` ON \`user\` (\`emp_id\`)`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_0f4e0316052db319b0e7e973e9b\` FOREIGN KEY (\`emp_id\`) REFERENCES \`employee\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_0f4e0316052db319b0e7e973e9b\``);
        await queryRunner.query(`DROP INDEX \`REL_0f4e0316052db319b0e7e973e9\` ON \`user\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`user_group\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`user_group\` enum ('Admin', 'User', 'Manager', 'QA') NOT NULL DEFAULT 'User'`);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`employment_status\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_0f4e0316052db319b0e7e973e9\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`emp_id\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`signup_status\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`cci_id\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_a361c74bd137e47786468113e0\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`emp_email\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`userId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`emp_status\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`emp_email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`phoneNumber\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_f2578043e491921209f5dadd08\` ON \`user\` (\`phoneNumber\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD CONSTRAINT \`FK_f4b0d329c4a3cf79ffe9d565047\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
