import { CommonException } from 'src/common/exceptions/common';
import { HttpStatus } from '@nestjs/common';

export class UnprocessableEntityException extends CommonException {
  constructor(errors, validationPipeError = false, args = {}) {
    super(
      { errors, validationPipeError, args },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
