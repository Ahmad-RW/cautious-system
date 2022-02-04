import { ConfigService } from '@nestjs/config';
import { ISetRedisRecord } from 'src/utils/redis/interfaces/set.interface';
import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
// redis library does not export types directly. So this is used to get auto complete only
type RedisClientType = typeof createClient extends () => infer ResultType
  ? ResultType
  : never;

@Injectable()
export class RedisService {
  private readonly redisClient: RedisClientType;
  constructor(private readonly configService: ConfigService) {
    const { port, host, db } = this.configService.get('redis');
    this.redisClient = createClient({
      url: `redis://${host}:${port}/${db} `,
      name: 'ctb_api',
    });
    this.redisClient.connect();
  }

  async set(setObject: ISetRedisRecord): Promise<string> {
    const shouldStringify = typeof setObject.value === 'object';
    const setValue: string = shouldStringify
      ? JSON.stringify(setObject.value)
      : setObject.value;
    return await this.redisClient.set(setObject.key, setValue, {
      EX: setObject.ttl,
    });
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async get(key: string): Promise<string> {
    return await this.redisClient.get(key);
  }

  async quit(): Promise<void> {
    await this.redisClient.quit();
  }

  getClient(): RedisClientType {
    return this.redisClient;
  }
}
