import { AppDataSource } from '../config/data-source';
import DesignationSeeder from './designation.seeder';
import MainSkillSeeder from './mainSkill.seeder';
import RoleSeeder from './role.seeder';

async function bootstrap() {
  // initialize the database connection
  const dataSource = await AppDataSource.initialize();

  // create instances of seeder classes
  const roleSeeder = new RoleSeeder();
  const mainSkillSeeder = new MainSkillSeeder();
  const designationSeeder = new DesignationSeeder();

  // run seeders
  await roleSeeder.run(dataSource);
  await designationSeeder.run(dataSource);
  await mainSkillSeeder.run(dataSource);

  console.log('\n\n         🍃 Database seeding is completed...\n\n');
  await dataSource.destroy(); // close the connection
}

bootstrap().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
