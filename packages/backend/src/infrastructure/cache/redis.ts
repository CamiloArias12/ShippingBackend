import Redis from 'ioredis';

export class RedisService {
  private client: Redis;
  private readonly ttl: number;

  constructor(host: string, port: number, password: string, db: number, ttl: number) {
    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      db
    });
    this.ttl = ttl;
  }

  async get(key: string): Promise<any> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.client.set(key, stringValue, 'EX', ttl);
      } else {
        await this.client.set(key, stringValue, 'EX', this.ttl);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async generateCacheKey(prefix: string, params: any): Promise<string> {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: any, key) => {
        if (params[key] !== undefined) {
          result[key] = params[key];
        }
        return result;
      }, {});

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }
}