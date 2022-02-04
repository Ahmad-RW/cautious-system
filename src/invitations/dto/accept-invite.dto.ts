import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { IsNotEmpty, Validate } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ValidToken } from 'src/invitations/invitations.validator';

export class AcceptInvite extends PartialType(
  OmitType(CreateUserDto, ['country'] as const),
) {
  @Validate(ValidToken, ['error.invalidToken'])
  @IsNotEmpty()
  token: string;
}
