import { EXISTS, UniqueValidator } from 'src/common/common.validator';
import { IsNotEmpty, IsObject, Validate } from 'class-validator';
import { Permission } from 'src/auth/entities/permission.entity';

export class AssignPermissionDto {
  @IsNotEmpty()
  @IsObject({ each: true })
  @Validate(UniqueValidator, [Permission, 'id', EXISTS], { each: true })
  permissions: Permission[];
}
