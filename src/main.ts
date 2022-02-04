import { AppModule } from 'src/app.module';
import { NestFactory } from '@nestjs/core';
import { setAppGlobals } from 'src/common-bootup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setAppGlobals(app);
  await app.listen(3000);
}

bootstrap();
