import { RoleId } from 'src/auth/enums/role.enum';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const WithRoles = (...roles: RoleId[]) => SetMetadata(ROLES_KEY, roles);
