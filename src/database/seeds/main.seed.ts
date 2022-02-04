import { Seeder, runSeeder } from 'typeorm-seeding';
import CountrySeeder from 'src/database/seeds/country.seed';
import PermissionsSeeder from 'src/database/seeds/permissions.seed';
import RolesSeeder from 'src/database/seeds/roles.seed';
import UserSeeder from 'src/database/seeds/users.seed';

export default class MainSeeder implements Seeder {
  public async run(): Promise<any> {
    await runSeeder(PermissionsSeeder);
    await runSeeder(RolesSeeder);
    await runSeeder(CountrySeeder);
    await runSeeder(UserSeeder);
  }
}
