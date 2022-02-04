import { CommonException } from 'src/common/exceptions/common';
import { HttpStatus } from '@nestjs/common';

export class NotImplementedException extends CommonException {
  constructor(
    message = 'error.exceptions.notImplemented',
    property: string = null,
    args = {},
  ) {
    super({ errors: [message, property], args }, HttpStatus.NOT_IMPLEMENTED);
  }
}
