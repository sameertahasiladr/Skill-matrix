import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEmployeeTable1741696784933 implements MigrationInterface {
    name = 'UpdateEmployeeTable1741696784933'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`reporting_to\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`current_location\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`present_city\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`present_state\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`current_client_one\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`current_client_two\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`current_client_three\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`current_client_four\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`current_business_sys_qualifications\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`current_core_tech_stack\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`current_secondary_tech_stack\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`current_experience\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`current_experience\` decimal(10,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`prev_emp_experience\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`prev_emp_experience\` decimal(10,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`years_served_in_curr_designation\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`years_served_in_curr_designation\` decimal(10,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`personal_interests\` \`personal_interests\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`personal_interests\` \`personal_interests\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`years_served_in_curr_designation\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`years_served_in_curr_designation\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`prev_emp_experience\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`prev_emp_experience\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`current_experience\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`current_experience\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`current_secondary_tech_stack\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`current_core_tech_stack\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`current_business_sys_qualifications\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`current_client_four\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`current_client_three\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`current_client_two\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`current_client_one\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`present_state\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`present_city\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`current_location\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`reporting_to\``);
    }

}
