import { ThrottlerModuleOptions } from '@nestjs/throttler';

type ThrottlerType = {
  limit: number;
  ttl: number;
};

export const globalThrottler: ThrottlerModuleOptions = {
  limit: 120,
  ttl: 60,
};

export const authThrottler: ThrottlerType = {
  limit: 10,
  ttl: 60,
};
