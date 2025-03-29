import Redis from 'ioredis';

export class RedisService {
  private redisConfig: {
    host: string;
    port: number;
    password: string;
    db: number;
    ttl: number;
  };
  private client: Redis;


  constructor(host: string, port: number, password: string, db: number, ttl: number) {
    this.redisConfig = {
      host,
      port,
      password,
      db,
      ttl,
    };
  }

  async connect(): Promise<void> { 
    try {
      this.client = new Redis({
        host: this.redisConfig.host,
        port: this.redisConfig.port,
        password: this.redisConfig.password,
        db: this.redisConfig.db,
      });
    } catch (error) {
      console.error('Redis db error:', error);
    }
  }
  
  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      console.log('Redis disconnected');
    } catch (error) {
      console.error('Redis disdb error:', error);
    }
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

  async set(key: string, value: any): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      await this.client.set(key, stringValue, 'EX', this.redisConfig.ttl);
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