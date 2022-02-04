import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/users/entities/user.entity';
import { classToPlain, plainToClass } from 'class-transformer';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<Record<string, any>>>
{
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Response<Record<string, any>>>> {
    const request = context.switchToHttp().getRequest();
    const user: User = plainToClass(User, request.user);
    let permissions: string[];
    if (user) {
      await user.reload();
      permissions = user.totalPermissions.map((value) => value.nameKey);
    }

    return next.handle().pipe(
      map((data) => {
        return { data: classToPlain(data, { groups: permissions }) };
      }),
    );
  }
}
