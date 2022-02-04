import { Country } from 'src/countries/entities/country.entity';
import { Role } from 'src/auth/entities/role.entity';
import { RoleId } from 'src/auth/enums/role.enum';
import { Seeder } from 'typeorm-seeding';
import { User } from 'src/users/entities/user.entity';
import { UserStatuses } from 'src/utils/state/constants/user.state';

export default class UserSeeder implements Seeder {
  usersData = [
    {
      id: 1,
      email: 'superadmin@cylab.com',
      username: 'superadmin',
      status: UserStatuses.ACTIVE,
      country: 1,
      password: '111',
      role: RoleId.admin,
    },
    {
      id: 2,
      email: 'businessadmin@cylab.com',
      username: 'businessadmin',
      status: UserStatuses.ACTIVE,
      country: 1,
      password: '111',
      role: RoleId.businessAdmin,
    },
    {
      id: 3,
      email: 'technicaladmin@cylab.com',
      username: 'technicaladmin',
      status: UserStatuses.ACTIVE,
      country: 1,
      password: '111',
      role: RoleId.technicalAdmin,
    },
    {
      id: 4,
      email: 'accountmanager@cylab.com',
      username: 'accountmanager',
      status: UserStatuses.ACTIVE,
      country: 1,
      password: '111',
      role: RoleId.accountManager,
    },
    {
      id: 5,
      email: 'labmanager@cylab.com',
      username: 'labmanager',
      status: UserStatuses.ACTIVE,
      country: 1,
      password: '111',
      role: RoleId.labManager,
    },
    {
      id: 6,
      email: 'player@cylab.com',
      username: 'player',
      status: UserStatuses.ACTIVE,
      country: 1,
      password: '111',
      role: RoleId.player,
    },
  ];

  public async run(): Promise<any> {
    const newUsers: User[] = [];
    for (const userData of this.usersData) {
      const user = new User();
      user.id = userData.id;
      user.email = userData.email;
      user.status = userData.status;
      user.username = userData.username;
      user.country = await Country.findOne({ id: userData.country });
      user.emailVerifyAt = new Date();
      user.password = '111';
      user.role = await Role.findOne({ id: userData.role });

      newUsers.push(user);
    }

    await User.upsert(newUsers, ['email']);
  }
}
