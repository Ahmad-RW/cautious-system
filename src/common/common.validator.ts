import * as moment from 'moment';
import {
  EntitySchema,
  FindConditions,
  ObjectType,
  getConnectionManager,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { NotImplementedException } from '@nestjs/common';
import { UnprocessableEntityException } from 'src/common/exceptions/unprocessable-entity.exception';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { VerificationsRepository } from 'src/auth/verifications.repository';

export const EXISTS = 'EXISTS';
export const NOT_EXISTS = 'NOT_EXISTS';

interface UniqueValidationArguments<E> extends ValidationArguments {
  constraints: [
    ObjectType<E> | EntitySchema<E> | string,
    ((validationArguments: ValidationArguments) => FindConditions<E>) | keyof E,
  ];
}

@ValidatorConstraint({ name: 'unique', async: true })
@Injectable()
export class UniqueValidator implements ValidatorConstraintInterface {
  public async validate<E>(
    value: string | Record<string, unknown>,
    args: UniqueValidationArguments<E>,
  ) {
    const [
      EntityClass,
      findCondition = args.property,
      validationMode = NOT_EXISTS,
    ] = args.constraints;
    const findValue =
      typeof value === 'object' ? value[findCondition.toString()] : value;

    const findResult = await getConnectionManager()
      .get()
      .getRepository(EntityClass)
      .count({
        where:
          typeof findCondition === 'function'
            ? findCondition(args)
            : {
                [findCondition || args.property]: findValue,
              },
      });

    return validationMode === NOT_EXISTS ? findResult <= 0 : findResult > 0;
  }

  public defaultMessage(args: ValidationArguments): string {
    const [
      EntityClass,
      findCondition = args.property,
      validationMode = NOT_EXISTS,
    ] = args.constraints;
    const entity = EntityClass.name || 'Entity';
    let message = `${entity} with the same '${findCondition}'`;
    message =
      validationMode === NOT_EXISTS
        ? message.concat(' already exist')
        : message.concat(' does not exist');
    return message;
  }
}

@ValidatorConstraint({ name: 'validToken', async: true })
export class ValidToken implements ValidatorConstraintInterface {
  async validate(token: string, args: ValidationArguments): Promise<boolean> {
    const [type] = args.constraints;
    if (token) {
      const verification = await getConnectionManager()
        .get()
        .getCustomRepository(VerificationsRepository)
        .findVerificationByToken(token, type);
      if (!verification || verification.expiresAt <= moment().toDate()) {
        return false;
      }
      return true;
    }
    return false;
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    const [, errorMessageKey] = validationArguments.constraints;
    return errorMessageKey;
  }
}
/* The type of the validator's operation.
 */
export type CompareValidatorOps =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'LESS_THAN'
  | 'LESS_THAN_EQ'
  | 'GREATER_THAN'
  | 'GREATER_THAN_EQ';

/* The interface ICompareValidatorArgs is a type that extends ValidationArguments. */
interface ICompareValidatorArgs extends ValidationArguments {
  constraints: [string, CompareValidatorOps, string];
}
@ValidatorConstraint({ name: 'compare' })
export class CompareValidator implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments: ICompareValidatorArgs,
  ): boolean | Promise<boolean> {
    const [otherValueKey, operation] = validationArguments.constraints;
    const otherValue = validationArguments.object[otherValueKey];
    let compareResult: boolean;

    try {
      //if any error happens in performCompare we don't want to return 500.
      compareResult = this.performCompare(value, otherValue, operation);
    } catch (error) {
      throw new UnprocessableEntityException(
        'error.exceptions.unprocessableEntity',
      );
    }
    return compareResult;
  }
  defaultMessage(validationArguments: ICompareValidatorArgs): string {
    const [, , errorMessageKey] = validationArguments.constraints;
    return errorMessageKey;
  }

  private performCompare(
    a: string | number,
    b: string | number,
    op: CompareValidatorOps,
  ) {
    switch (op) {
      case 'EQUALS':
        return a === b;
      case 'NOT_EQUALS':
        return a !== b;
      case 'LESS_THAN':
        return a < b;
      case 'LESS_THAN_EQ':
        return a <= b;
      case 'GREATER_THAN':
        return a > b;
      case 'GREATER_THAN_EQ':
        return a >= b;
      default:
        throw new NotImplementedException();
    }
  }
}
