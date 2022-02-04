import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from 'src/common/transform.interceptor';
import { UnprocessableEntityException } from 'src/common/exceptions/unprocessable-entity.exception';
import { ValidationError } from 'class-validator';

export const setAppGlobals = (app: INestApplication) => {
  app.setGlobalPrefix('/api');
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableCors();
  //this call is to tell Nest we want it to call shutdown hooks on termination
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const errorsList = errors.map((err) => {
          return {
            property: err.property,
            messages: Object.values(err.constraints),
          };
        });

        throw new UnprocessableEntityException(errorsList, true);
      },
    }),
  );
};
