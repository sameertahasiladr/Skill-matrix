import { MigrationInterface, QueryRunner } from "typeorm";

export class IntialDBMigration11738857912656 implements MigrationInterface {
    name = 'IntialDBMigration11738857912656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`role\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`main_skill\` (\`id\` varchar(36) NOT NULL, \`mainSkill\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`levels\` (\`id\` varchar(36) NOT NULL, \`level\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tags\` (\`id\` char(36) NOT NULL, \`tags\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tag_skills\` (\`id\` varchar(36) NOT NULL, \`skills_id\` varchar(36) NULL, \`tags_id\` char(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`skills\` (\`id\` varchar(36) NOT NULL, \`skills\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`example\` varchar(255) NULL, \`responsibilities\` varchar(255) NULL, \`levels_id\` varchar(36) NULL, \`master_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`master\` (\`id\` varchar(36) NOT NULL, \`description\` text NOT NULL, \`designationId\` varchar(36) NULL, \`roleId\` varchar(36) NULL, \`mainSkillId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`designation\` (\`id\` varchar(36) NOT NULL, \`designation\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`employee\` (\`id\` varchar(36) NOT NULL, \`emp_email\` varchar(255) NOT NULL, \`date_of_joining\` date NOT NULL, \`date_of_leaving\` date NULL, \`current_grade\` varchar(255) NOT NULL, \`current_experience\` int NOT NULL, \`prev_emp_experience\` int NOT NULL, \`years_served_in_curr_designation\` int NOT NULL, \`curr_designation_since\` date NOT NULL, \`emp_status\` varchar(255) NOT NULL, \`personal_interests\` varchar(255) NOT NULL, \`current_dept\` varchar(255) NOT NULL, \`user_group\` enum ('Admin', 'User', 'Manager', 'QA') NOT NULL DEFAULT 'User', \`curr_designation_for_reporting\` varchar(255) NOT NULL, \`userId\` varchar(36) NULL, \`current_designation_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`phoneNumber\` varchar(255) NULL, \`role\` varchar(255) NOT NULL DEFAULT 'user', \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` ADD CONSTRAINT \`FK_df4726c622c12a8bfa37bf6d23b\` FOREIGN KEY (\`skills_id\`) REFERENCES \`skills\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` ADD CONSTRAINT \`FK_7620c24c7cfde6a19267f120b29\` FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`skills\` ADD CONSTRAINT \`FK_1a77fe5eed21a18ed3fe1208f9b\` FOREIGN KEY (\`levels_id\`) REFERENCES \`levels\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`skills\` ADD CONSTRAINT \`FK_c05e52265a4bdb2d706d39cb7e1\` FOREIGN KEY (\`master_id\`) REFERENCES \`master\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`master\` ADD CONSTRAINT \`FK_190db29046b2b7e2de0f6c0919d\` FOREIGN KEY (\`designationId\`) REFERENCES \`designation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`master\` ADD CONSTRAINT \`FK_4754388f95f7a0ef1b3093af96c\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`master\` ADD CONSTRAINT \`FK_f4818bd8f779b41c9f87bdb5943\` FOREIGN KEY (\`mainSkillId\`) REFERENCES \`main_skill\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD CONSTRAINT \`FK_f4b0d329c4a3cf79ffe9d565047\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD CONSTRAINT \`FK_8c727fe62ed068c16a6cb6cbf4a\` FOREIGN KEY (\`current_designation_id\`) REFERENCES \`designation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` DROP FOREIGN KEY \`FK_8c727fe62ed068c16a6cb6cbf4a\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP FOREIGN KEY \`FK_f4b0d329c4a3cf79ffe9d565047\``);
        await queryRunner.query(`ALTER TABLE \`master\` DROP FOREIGN KEY \`FK_f4818bd8f779b41c9f87bdb5943\``);
        await queryRunner.query(`ALTER TABLE \`master\` DROP FOREIGN KEY \`FK_4754388f95f7a0ef1b3093af96c\``);
        await queryRunner.query(`ALTER TABLE \`master\` DROP FOREIGN KEY \`FK_190db29046b2b7e2de0f6c0919d\``);
        await queryRunner.query(`ALTER TABLE \`skills\` DROP FOREIGN KEY \`FK_c05e52265a4bdb2d706d39cb7e1\``);
        await queryRunner.query(`ALTER TABLE \`skills\` DROP FOREIGN KEY \`FK_1a77fe5eed21a18ed3fe1208f9b\``);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` DROP FOREIGN KEY \`FK_7620c24c7cfde6a19267f120b29\``);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` DROP FOREIGN KEY \`FK_df4726c622c12a8bfa37bf6d23b\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`employee\``);
        await queryRunner.query(`DROP TABLE \`designation\``);
        await queryRunner.query(`DROP TABLE \`master\``);
        await queryRunner.query(`DROP TABLE \`skills\``);
        await queryRunner.query(`DROP TABLE \`tag_skills\``);
        await queryRunner.query(`DROP TABLE \`tags\``);
        await queryRunner.query(`DROP TABLE \`levels\``);
        await queryRunner.query(`DROP TABLE \`main_skill\``);
        await queryRunner.query(`DROP TABLE \`role\``);
    }

}
