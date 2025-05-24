import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Logger } from '@nestjs/common';
import { Designation } from '../master/entities/designation.entity';

export default class DesignationSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {

    const designations = [
      { designation: 'Junior Developer' },
      { designation: 'Senior Developer' },
      { designation: 'Developer' },
      { designation: 'Team Lead' },
      { designation: 'Team Manager' },
      { designation: 'Senior Database Administrator' },
    ];

    const repository = dataSource.getRepository(Designation);

    for (const designation of designations) {
      const existingDesignation = await repository.findOne({
        where: { designation: designation.designation },
      });

      // if the designation doesn't exist, then insert
      if (!existingDesignation) {
        await repository.insert(designation);
      } else {
        // else, skip the insertion
        Logger.log(
          `Skipped insertion for designation: ${designation.designation} (already exists)`,
        );
      }
    }

    Logger.log('Designation table have been seeded!');
  }
}
