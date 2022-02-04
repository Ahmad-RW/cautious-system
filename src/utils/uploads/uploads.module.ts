import { Module } from '@nestjs/common';
import { UploadsController } from 'src/utils/uploads/uploads.controller';
import { UploadsService } from 'src/utils/uploads/uploads.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
