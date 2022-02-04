import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UploadsService } from 'src/utils/uploads/uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Throttle(20, 60)
  @Get()
  async createPresignedUrl() {
    return this.uploadsService.generateUrl();
  }
}
