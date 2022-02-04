import { CommonException } from 'src/common/exceptions/common';
import { HttpStatus } from '@nestjs/common';

export class NotFoundException extends CommonException {
  constructor(
    message = 'error.exceptions.notFound',
    property: string = null,
    args = {},
  ) {
    super({ errors: [{ message, property }], args }, HttpStatus.NOT_FOUND);
  }
}
