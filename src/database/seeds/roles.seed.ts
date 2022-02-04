import { In } from 'typeorm';
import { Permission } from 'src/auth/entities/permission.entity';
import { Role } from 'src/auth/entities/role.entity';
import { RoleId, RolePermissions } from 'src/auth/enums/role.enum';
import { Seeder } from 'typeorm-seeding';

export default class RolesSeeder implements Seeder {
  public async run(): Promise<any> {
    const roleList: Role[] = [];

    const adminRole = new Role();
    adminRole.id = RoleId.admin;
    adminRole.name = 'admin';
    adminRole.permissions = await this.getAdminPermissions();

    roleList.push(adminRole);

    for (const role of RolePermissions) {
      const newRole = new Role();
      newRole.id = role.id;
      newRole.name = role.name;
      newRole.permissions = await Permission.find({
        where: { nameKey: In(role.permissions) },
      });

      roleList.push(newRole);
    }

    await Role.save(roleList);
  }

  private async getAdminPermissions(): Promise<Permission[]> {
    // Admin gets all the permissions
    return await Permission.find();
  }
}
