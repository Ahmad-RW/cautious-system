import { EXISTS, UniqueValidator } from 'src/common/common.validator';
import { IsNotEmpty, IsObject, Validate } from 'class-validator';
import { Role } from 'src/auth/entities/role.entity';

export class AssignRoleDto {
  @IsNotEmpty()
  @IsObject()
  @Validate(UniqueValidator, [Role, 'id', EXISTS])
  role: Role;
}
