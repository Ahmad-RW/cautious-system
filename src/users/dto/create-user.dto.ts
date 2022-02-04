import {
  BlacklistValidator,
  PasswordStrengthValidator,
  ValidUserName,
} from 'src/users/users.validator';
import { Country } from 'src/countries/entities/country.entity';
import { EXISTS, UniqueValidator } from 'src/common/common.validator';
import {
  IsEmail,
  IsObject,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  @Validate(UniqueValidator, [User, 'email'])
  @Validate(BlacklistValidator, ['email'])
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @Validate(UniqueValidator, [User, 'username'])
  @Validate(BlacklistValidator, ['username'])
  @Validate(ValidUserName)
  @MaxLength(35)
  @MinLength(6)
  @Transform(({ value }) => value.toLowerCase().replace(' ', ''))
  username: string;

  @IsString()
  @MaxLength(35)
  @MinLength(8)
  @Validate(PasswordStrengthValidator)
  password: string;

  @IsObject()
  @Validate(UniqueValidator, [Country, 'id', EXISTS])
  country: Country;
}
