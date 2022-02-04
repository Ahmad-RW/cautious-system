import * as moment from 'moment-timezone';
import { Blacklist } from 'src/auth/entities/blacklist.entity';
import { REGEX } from 'src/common/regex';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
@ValidatorConstraint({ name: 'invalidEmail', async: true })
export class BlacklistValidator implements ValidatorConstraintInterface {
  async validate(value: string, args: any): Promise<boolean> {
    const [type] = args.constraints;
    if (!type) {
      return true;
    }

    if (!value) {
      return true;
    }

    let lookUpValue: string;
    if (type !== 'email') {
      lookUpValue = value;
    } else {
      //handle if value is email
      lookUpValue = value.substring(value.indexOf('@') + 1);
    }

    const blacklist = await Blacklist.find({
      where: { blacklistName: lookUpValue, type },
    });

    return blacklist.length === 0;
  }

  defaultMessage(args: ValidationArguments) {
    const [type] = args.constraints;
    return `The ${type} (${args.value}) is invalid!`;
  }
}

@ValidatorConstraint({ name: 'passwordStrength', async: true })
export class PasswordStrengthValidator implements ValidatorConstraintInterface {
  async validate(text: string) {
    if (text) {
      return (
        REGEX.numbers.test(text) &&
        REGEX.lowercase.test(text) &&
        REGEX.uppercase.test(text) &&
        REGEX.specialCharacter.test(text) &&
        text.length >= 8
      );
    }
    return false;
  }

  defaultMessage() {
    return 'error.weakPassword';
  }
}

@ValidatorConstraint({ name: 'invalidTimezone', async: true })
export class TimezoneValidator implements ValidatorConstraintInterface {
  async validate(value: string): Promise<boolean> {
    if (!value) {
      return true;
    }

    return moment.tz.names().includes(value);
  }

  defaultMessage() {
    return 'error.invalidTimezone';
  }
}

@ValidatorConstraint({ name: 'validUserName', async: true })
export class ValidUserName implements ValidatorConstraintInterface {
  validate(username: string): boolean {
    return REGEX.username.test(username);
  }

  defaultMessage() {
    return 'error.invalidUsername';
  }
}
