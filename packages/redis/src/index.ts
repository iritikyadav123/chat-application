import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

const REDIS_URL = 'redis://localhost:6379';

export const redisClient: any = createClient({
  url: REDIS_URL,
});


export const connectRedis = async (): Promise<RedisClientType> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Redis connected');
  }
  return redisClient;
};
connectRedis()




