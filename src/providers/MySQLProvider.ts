import { IDatabase, IDatabaseConfig, IDatabaseProvider } from "../Interfaces/IDatabase"; // eslint-disable-line

export class MySQLProvider implements IDatabaseProvider {
  createDatabase(config: IDatabaseConfig): IDatabase {
    return new MySQLDatabase(config);
  }

  getRequiredEnvVars(): string[] {
    return ["MYSQL_DB_HOST", "MYSQL_DB_USER", "MYSQL_DB_NAME", "MYSQL_DB_PASSWORD"];
  }

  validateConfig(config: IDatabaseConfig): boolean {
    return !!(config.host && config.user && config.database);
  }

  // Optimized method for quick validation without creating full instance
  async validateConnection(config: IDatabaseConfig): Promise<boolean> {
    let connection: any = null;
    try {
      // Dynamic import - only load mysql2 when needed
      const mysql = await import("mysql2/promise");
      
      connection = await mysql.createConnection({
        host: config.host,
        port: config.port || 3306,
        user: config.user,
        password: config.password,
        database: config.database,
        connectTimeout: 5000 // 5 segundos máximo
      });
      
      await connection.ping();
      return true;
    } catch (error) {
      return false;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  // Simple method to check connection and create database if needed
  async checkConnectionAndCreateDB(config: IDatabaseConfig): Promise<{ success: boolean; error?: string }> {
    let connection: any = null;
    try {
      // Dynamic import - only load mysql2 when needed
      const mysql = await import("mysql2/promise");
      
      // First, try to connect without specifying a database
      connection = await mysql.createConnection({
        host: config.host,
        port: config.port || 3306,
        user: config.user,
        password: config.password,
        connectTimeout: 10000
      });

      // Test connection first
      await connection.ping();
      
      // Check if database exists
      const [rows] = await connection.execute(
        "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
        [config.database]
      );

      const exists = Array.isArray(rows) && rows.length > 0;
      
      if (!exists) {
        // Database doesn't exist, create it
        await connection.execute(`CREATE DATABASE \`${config.database}\``);
        console.log(`✅ Database '${config.database}' created successfully`);
      }

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMsg };
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  
}

class MySQLDatabase implements IDatabase {
  private config: IDatabaseConfig;
  private connection: any = null;
  private connected: boolean = false;

  constructor(config: IDatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // Dynamic import - only load mysql2 when needed
      const mysql = await import("mysql2/promise");
      
      this.connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port || 3306,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        connectTimeout: 10000
      });

      await this.connection.ping();
      this.connected = true;
      console.log(`✅ Connected to MySQL on ${this.config.host}:${this.config.port || 3306}`);
    } catch (error) {
      this.connected = false;
      throw new Error(`Error connecting to MySQL: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
    this.connected = false;
    console.log("🔌 Disconnected from MySQL");
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConfig(): IDatabaseConfig {
    return { ...this.config };
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.connection) {
        await this.connection.ping();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
