import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobTable1741240250438 implements MigrationInterface {
  name = 'CreateJobTable1741240250438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`job\` (\`id\` varchar(36) NOT NULL, \`jobType\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`uploadDate\` timestamp NOT NULL, \`uploadSummary\` varchar(255) NULL, \`download\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`job\``);
  }
}
