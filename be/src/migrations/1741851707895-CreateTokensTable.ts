import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTokensTable1741851707895 implements MigrationInterface {
    name = 'CreateTokensTable1741851707895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tokens\` (\`id\` varchar(36) NOT NULL, \`token\` varchar(255) NOT NULL, \`cci_id\` varchar(255) NOT NULL, \`expiryDate\` timestamp NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`tokens\``);
    }

}
