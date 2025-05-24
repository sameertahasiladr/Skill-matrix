import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTokenTable1742198510658 implements MigrationInterface {
    name = 'UpdateTokenTable1742198510658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tokens\` CHANGE \`expiryDate\` \`expires_at\` timestamp NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tokens\` CHANGE \`expires_at\` \`expiryDate\` timestamp NOT NULL`);
    }

}
