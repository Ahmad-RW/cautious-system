import { AssignPermissionDto } from 'src/auth/dto/assign-permission.dto';
import { AssignRoleDto } from 'src/auth/dto/assign-role.dto';
import { BindEntityPipe } from 'src/common/pipes/bind-entity.pipe';
import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ISuccessResponse } from 'src/common/interfaces/success-response.interface';
import { Permission } from 'src/auth/entities/permission.entity';
import { PermissionKeys } from 'src/auth/enums/permission.enum';
import { Role } from 'src/auth/entities/role.entity';
import { RoleAuthorizationPipe } from 'src/auth/pipes/role-authorization.pipe';
import { RolesPermissionsService } from 'src/auth/services/roles-permissions.service';
import { User } from 'src/users/entities/user.entity';
import { WithPermissions } from 'src/auth/decorators/with-permissions.decorator';

@Controller('')
export class RolesPermissionsController {
  constructor(
    private readonly rolePermissionService: RolesPermissionsService,
  ) {}

  @Get('roles')
  @WithPermissions(PermissionKeys.roleViewAll)
  async getAllRoles(): Promise<Role[]> {
    return await this.rolePermissionService.getAllRoles();
  }

  @Get('roles/:id')
  @WithPermissions(PermissionKeys.roleViewOne)
  async getRole(@Param('id') id: number): Promise<Role> {
    return await this.rolePermissionService.getRoleById(id);
  }

  @Put('roles/assign-to-user/:id')
  @WithPermissions(PermissionKeys.roleAssignToUser)
  async assignRoleToUser(
    @I18n() i18n: I18nContext,
    @Param('id', RoleAuthorizationPipe) user: User,
    @Body() { role }: AssignRoleDto,
  ): Promise<ISuccessResponse> {
    await this.rolePermissionService.assignRoleToUser(role, user);
    return {
      message: await i18n.translate('info.roleAssigned', {
        args: { user: user.username, role: user.role.name },
      }),
    };
  }

  @Put('roles/assign-permissions/:id')
  @WithPermissions(PermissionKeys.permissionAssignToRole)
  async assignPermissionToRole(
    @I18n() i18n: I18nContext,
    @Param('id', BindEntityPipe) role: Role,
    @Body() { permissions }: AssignPermissionDto,
  ): Promise<ISuccessResponse> {
    await this.rolePermissionService.assignPermissionsToRole(role, permissions);
    return {
      message: await i18n.translate('info.permissionAssigned', {
        args: { role: role.name },
      }),
    };
  }

  @Get('permissions')
  @WithPermissions(PermissionKeys.permissionViewAll)
  async getPermissions(): Promise<Permission[]> {
    return await this.rolePermissionService.getAllPermissions();
  }
}
