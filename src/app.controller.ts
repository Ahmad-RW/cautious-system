import { AppService } from 'src/app.service';
import { Controller, Get } from '@nestjs/common';
import { SkipAuth } from 'src/auth/decorators/skip-auth.decorator';

@Controller()
@SkipAuth()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
