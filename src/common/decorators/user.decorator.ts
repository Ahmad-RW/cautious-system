import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User as UserEntity } from 'src/users/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
