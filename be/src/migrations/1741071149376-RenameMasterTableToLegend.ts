import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameMasterTableToLegend1741071149376
  implements MigrationInterface
{
  name = 'RenameMasterTableToLegend1741071149376';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('master', 'legend');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('legend', 'master');
  }
}
