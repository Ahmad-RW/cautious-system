import { CommonException } from 'src/common/exceptions/common';
import { HttpStatus } from '@nestjs/common';

export class ForbiddenException extends CommonException {
  constructor(
    message = 'error.exceptions.forbidden',
    property: string = null,
    args = {},
  ) {
    super({ errors: [{ message, property }], args }, HttpStatus.FORBIDDEN);
  }
}
