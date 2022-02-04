export interface ISetRedisRecord {
  key: string;
  value: Record<string, any> | string | number | any;
  ttl?: number;
}
