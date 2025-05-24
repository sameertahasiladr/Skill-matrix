import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSkillMatrixTable1741080954476 implements MigrationInterface {
    name = 'UpdateSkillMatrixTable1741080954476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tag_skills\` DROP FOREIGN KEY \`FK_df4726c622c12a8bfa37bf6d23b\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` DROP FOREIGN KEY \`FK_7620c24c7cfde6a19267f120b29\``);
        await queryRunner.query(`ALTER TABLE \`tags\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`tags\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`tags\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` DROP COLUMN \`tags_id\``);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` ADD \`tags_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_f2578043e491921209f5dadd08\` (\`phoneNumber\`)`);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` ADD CONSTRAINT \`FK_df4726c622c12a8bfa37bf6d23b\` FOREIGN KEY (\`skills_id\`) REFERENCES \`skill_matrix\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` ADD CONSTRAINT \`FK_7620c24c7cfde6a19267f120b29\` FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` ADD COLUMN \`role_id\` varchar(36) NULL;`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` ADD CONSTRAINT \`FK_fe764d01c2f41e04393204c0a1e\` FOREIGN KEY (\`role_id\`) REFERENCES \`role\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` ADD COLUMN \`mainSkill_id\` varchar(36) NULL;`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` ADD CONSTRAINT \`FK_db37214f18c2ab1072260896017\` FOREIGN KEY (\`mainSkill_id\`) REFERENCES \`main_skill\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` ADD COLUMN \`designation_id\` varchar(36) NULL;`);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` ADD CONSTRAINT \`FK_ed7b9756ced5b3ab109304db071\` FOREIGN KEY (\`designation_id\`) REFERENCES \`designation\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` DROP FOREIGN KEY \`FK_ed7b9756ced5b3ab109304db071\``);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` DROP FOREIGN KEY \`FK_db37214f18c2ab1072260896017\``);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` DROP FOREIGN KEY \`FK_fe764d01c2f41e04393204c0a1e\``);
        await queryRunner.query(`ALTER TABLE \`skill_matrix\` DROP FOREIGN KEY \`FK_478e129d3f468c1f3612ec80fb3\``);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` DROP FOREIGN KEY \`FK_7620c24c7cfde6a19267f120b29\``);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` DROP FOREIGN KEY \`FK_df4726c622c12a8bfa37bf6d23b\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_f2578043e491921209f5dadd08\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` DROP COLUMN \`tags_id\``);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` ADD \`tags_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`tags\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`tags\` ADD \`id\` char(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tags\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` ADD CONSTRAINT \`FK_7620c24c7cfde6a19267f120b29\` FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`DROP TABLE \`skill_matrix\``);
        await queryRunner.query(`ALTER TABLE \`tag_skills\` ADD CONSTRAINT \`FK_df4726c622c12a8bfa37bf6d23b\` FOREIGN KEY (\`skills_id\`) REFERENCES \`skills\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
