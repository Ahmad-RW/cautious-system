import { CommonException } from 'src/common/exceptions/common';
import { HttpStatus } from '@nestjs/common';

export class UnauthorizedException extends CommonException {
  constructor(
    message = 'error.exceptions.unauthorized',
    property: string = null,
    args = {},
  ) {
    super({ errors: [{ message, property }], args }, HttpStatus.UNAUTHORIZED);
  }
}
