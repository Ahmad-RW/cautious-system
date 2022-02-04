import { AuthService } from 'src/auth/services/auth.service';
import { AuthGuard as BaseAuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SKIP_AUTH } from 'src/auth/decorators/skip-auth.decorator';
import { UnauthorizedException } from 'src/common/exceptions/unauthorized.exception';

const AUTH_HEADER = 'authorization';
@Injectable()
export class AuthGuard extends BaseAuthGuard('jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    //if route is decorated with skip auth. then directly return true
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipAuth) {
      return true;
    }

    try {
      const token = this.getTokenFromAuthHeader(request);

      //JWT validity.
      await super.canActivate(context);
      //check redis session
      const exists = await this.authService.sessionExists(
        request.user.id,
        token,
      );
      if (!exists) {
        throw new UnauthorizedException();
      }
      return true;
    } catch (error) {
      // in case any error occurs during JWT validation flow. Return unauthorized.
      throw new UnauthorizedException();
    }
  }
  getTokenFromAuthHeader(request: Request): string {
    // Bearer <token>
    return request.headers[AUTH_HEADER].substring(7);
  }
}
