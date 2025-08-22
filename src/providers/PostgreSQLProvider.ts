import { IDatabase, IDatabaseConfig, IDatabaseProvider } from "../Interfaces/IDatabase"; // eslint-disable-line

export class PostgreSQLProvider implements IDatabaseProvider {
  createDatabase(config: IDatabaseConfig): IDatabase {
    return new PostgreSQLDatabase(config);
  }

  getRequiredEnvVars(): string[] {
    return ["POSTGRES_DB_HOST", "POSTGRES_DB_USER", "POSTGRES_DB_NAME", "POSTGRES_DB_PASSWORD"];
  }

  validateConfig(config: IDatabaseConfig): boolean {
    return !!(config.host && config.user && config.database);
  }

  // Optimized method for quick validation
  async validateConnection(config: IDatabaseConfig): Promise<boolean> {
    let client: any = null;
    try {
      // Dynamic import - only load pg when needed
      const { Client } = await import("pg");
      
      client = new Client({
        host: config.host,
        port: config.port || 5432,
        user: config.user,
        password: config.password,
        database: config.database,
        connectionTimeoutMillis: 5000
      });
      
      await client.connect();
      await client.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    } finally {
      if (client) {
        await client.end();
      }
    }
  }
}

class PostgreSQLDatabase implements IDatabase {
  private config: IDatabaseConfig;
  private client: any = null;
  private connected: boolean = false;

  constructor(config: IDatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // Dynamic import - only load pg when needed
      const { Client } = await import("pg");
      
      this.client = new Client({
        host: this.config.host,
        port: this.config.port || 5432,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database
      });

      await this.client.connect();
      this.connected = true;
      console.log(`✅ Connected to PostgreSQL on ${this.config.host}:${this.config.port || 5432}`); 
    } catch (error) {
      this.connected = false;
      throw new Error(`Error connecting to PostgreSQL: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
    this.connected = false;
    console.log("🔌 Disconnected from PostgreSQL");
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
        await this.client.query('SELECT 1');  
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
