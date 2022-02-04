import { AuthService } from 'src/auth/services/auth.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';
import { PERMISSIONS_KEY } from 'src/auth/decorators/with-permissions.decorator';
import { Reflector } from '@nestjs/core';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );
    const user: User = context.switchToHttp().getRequest().user;

    if (
      !user ||
      !allowedPermissions ||
      this.authService.can(user, allowedPermissions)
    )
      return true;

    throw new ForbiddenException();
  }
}
