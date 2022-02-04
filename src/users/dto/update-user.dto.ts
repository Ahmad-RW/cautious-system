import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { IsOptional, IsString, Validate } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { TimezoneValidator } from 'src/users/users.validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @IsString()
  @IsOptional()
  @Validate(TimezoneValidator)
  timeZone: string;

  @IsOptional()
  avatar: string;
}
