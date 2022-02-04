import { Module, OnModuleDestroy } from '@nestjs/common';
import { RedisService } from 'src/utils/redis/redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule implements OnModuleDestroy {
  constructor(private readonly redisService: RedisService) {}
  onModuleDestroy() {
    // on application termination we want to disconnect redis
    this.redisService.quit();
  }
}
