import { CommonException } from 'src/common/exceptions/common';
import { HttpStatus } from '@nestjs/common';

export class BadRequestException extends CommonException {
  constructor(
    message = 'error.exceptions.badRequest',
    property: string = null,
    args = {},
  ) {
    super({ errors: [{ message, property }], args }, HttpStatus.BAD_REQUEST);
  }
}
