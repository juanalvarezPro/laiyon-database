import { IDatabase, IDatabaseConfig, IDatabaseProvider } from "../Interfaces/IDatabase"; // eslint-disable-line

export class MongoDBProvider implements IDatabaseProvider {
  createDatabase(config: IDatabaseConfig): IDatabase {
    return new MongoDBDatabase(config);
  }

  getRequiredEnvVars(): string[] {
    return ["MONGODB_URI"];
  }

  validateConfig(config: IDatabaseConfig): boolean {
    return !!(config.url);
  }

  // Optimized method for quick validation
  async validateConnection(config: IDatabaseConfig): Promise<boolean> {
    let client: any = null;
    try {
      // Dynamic import - only load mongodb when needed
      const { MongoClient } = await import("mongodb");
      
      client = new MongoClient(config.url!, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      
      await client.connect();
      await client.db().admin().ping();
      return true;
    } catch (error) {
      return false;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }
}

class MongoDBDatabase implements IDatabase {
  private config: IDatabaseConfig;
  private client: any = null;
  private connected: boolean = false;

  constructor(config: IDatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // Dynamic import - only load mongodb when needed
      const { MongoClient } = await import("mongodb");
      
      this.client = new MongoClient(this.config.url!);
      await this.client.connect();
      this.connected = true;
      console.log(`✅ Successfully connected to MongoDB`);
    } catch (error) {
      this.connected = false;
      throw new Error(`Error connecting to MongoDB: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    this.connected = false;
    console.log("🔌 Disconnected from MongoDB");
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConfig(): IDatabaseConfig {
    return { ...this.config };
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.client) {
        await this.client.db().admin().ping();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
