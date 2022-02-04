import { ArgumentMetadata, Inject, Injectable } from '@nestjs/common';
import { BindEntityPipe } from 'src/common/pipes/bind-entity.pipe';
import { Connection } from 'typeorm';
import { DependentRoles } from 'src/auth/enums/role.enum';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';
import { REQUEST } from '@nestjs/core';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RoleAuthorizationPipe extends BindEntityPipe {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    protected readonly connection: Connection,
  ) {
    super(connection);
  }

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const targetUser: User = await super.transform(value, metadata);
    const currentUser: User = this.request.user;

    if (!DependentRoles[currentUser.role.id].includes(targetUser.role.id)) {
      throw new ForbiddenException();
    }

    return targetUser;
  }
}
