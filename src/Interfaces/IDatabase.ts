export interface IDatabaseConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  filename?: string; // Para SQLite
  url?: string; // Para MongoDB y otros
}

export interface IDatabase {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConfig(): IDatabaseConfig;
}

export interface IDatabaseProvider {
  createDatabase(config: IDatabaseConfig): IDatabase;
  getRequiredEnvVars(): string[];
  validateConfig(config: IDatabaseConfig): boolean;
  validateConnection?(config: IDatabaseConfig): Promise<boolean>;
  checkConnectionAndCreateDB?(config: IDatabaseConfig): Promise<{ success: boolean; error?: string }>;
}
