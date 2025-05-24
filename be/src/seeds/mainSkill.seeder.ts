import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Logger } from '@nestjs/common';
import { MainSkill } from '../master/entities/mainskill.entity';

export default class MainSkillSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {

    const mainSkills = [
      { mainSkill: 'NodeJS' },
      { mainSkill: 'VueJS' },
      { mainSkill: 'Dotnet core' },
      { mainSkill: 'Database' },
      { mainSkill: 'Unit Testing' },
      { mainSkill: 'Php' },
      { mainSkill: 'Angular' },
      { mainSkill: 'Code Versioning' },
      { mainSkill: 'Core' },
      { mainSkill: 'NestJS' },
      { mainSkill: 'Java' },
      { mainSkill: 'JavaScript' },
      { mainSkill: 'Python' },
      { mainSkill: 'Automation E2E Testing' },
      { mainSkill: 'ReactJS' },
      { mainSkill: 'TypeScript' },
    ];
    const repository = dataSource.getRepository(MainSkill);
    for (const mainsSkill of mainSkills) {
      const existingSkill = await repository.findOne({
        where: { mainSkill: mainsSkill.mainSkill },
      });

      // if the main skill doesn't exist, then insert
      if (!existingSkill) {
        await repository.insert(mainsSkill);
      } else {
        // else, skip the insertion
        Logger.log(
          `Skipped insertion for main skill: ${mainsSkill.mainSkill} (already exists)`,
        );
      }
    }

    Logger.log('MainSkill table has been seeded!');
  }
}
