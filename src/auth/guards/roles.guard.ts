import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';
import { ROLES_KEY } from 'src/auth/decorators/with-roles.decorator';
import { Reflector } from '@nestjs/core';
import { RoleId } from 'src/auth/enums/role.enum';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<RoleId[]>(ROLES_KEY, context.getHandler());
    const user: User = context.switchToHttp().getRequest().user;

    if (!user || !roles || roles.includes(user.role.id)) return true;

    throw new ForbiddenException();
  }
}
