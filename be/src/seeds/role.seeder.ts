import { Seeder } from 'typeorm-extension';
import { Logger } from '@nestjs/common';
import { Role } from '../master/entities/role.entity';
import { DataSource } from 'typeorm';

export default class RoleSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {

    const roles = [
      { title: 'Backend' },
      { title: 'Frontend' },
      { title: 'Developer' },
      { title: 'QA' },
      { title: 'Team Manager' },
    ];
    const repository = dataSource.getRepository(Role);

    for (const role of roles) {
      const existingRole = await repository.findOne({
        where: { title: role.title },
      });

      // if the role doesn't exist, then insert
      if (!existingRole) {
        await repository.insert(role);
      } else {
        // else, skip the insertion
        Logger.log(
          `Skipped insertion for role: ${role.title} (already exists)`,
        );
      }
    }

    Logger.log('Role table has been seeded!');
  }
}
