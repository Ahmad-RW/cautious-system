import { Injectable } from '@nestjs/common';
import { Permission } from 'src/auth/entities/permission.entity';
import { Role } from 'src/auth/entities/role.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RolesPermissionsService {
  async getAllRoles(): Promise<Role[]> {
    return await Role.find();
  }

  async getRoleById(type: number): Promise<Role> {
    return await Role.findOneOrFail({
      id: type,
    });
  }

  async assignRoleToUser(role: Role, user: User): Promise<User> {
    user.role = role;
    await (await user.save()).reload();
    return user;
  }

  async assignPermissionsToRole(
    role: Role,
    permissions: Permission[],
  ): Promise<Role> {
    role.permissions = permissions;
    (await role.save()).reload;

    return role;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await Permission.find();
  }
}
