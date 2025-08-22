import { IDatabaseConfig, IDatabaseProvider } from "../Interfaces/IDatabase.js";
import { MySQLProvider } from "../providers/MySQLProvider.js";
import { PostgreSQLProvider } from "../providers/PostgreSQLProvider.js";
import { MongoDBProvider } from "../providers/MongoDBProvider.js";
import chalk from "chalk";
import ora from "ora";
import { configBDRelational } from "../prompts/configBD.sql";
import { configBDNoSQL } from "../prompts/configBD.nosql";

export class DatabaseConfigService {
  private static providers: Map<string, IDatabaseProvider> = new Map([
    ["mysql", new MySQLProvider()],
    ["postgresql", new PostgreSQLProvider()],
    ["mongodb", new MongoDBProvider()],
  ]);

  // Simple cache for validated configurations during session
  private static configCache: Map<string, { config: IDatabaseConfig; timestamp: number }> = new Map();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Method to generate cache key
  private static getCacheKey(dbType: string, config: IDatabaseConfig): string {
    return `${dbType}:${config.host}:${config.port}:${config.user}:${config.database}`;
  }

  // Method to check if a configuration is cached and valid
  private static isConfigCached(dbType: string, config: IDatabaseConfig): boolean {
    const cacheKey = this.getCacheKey(dbType, config);
    const cached = this.configCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return true;
    }
    
    // Clean expired entry
    if (cached) {
      this.configCache.delete(cacheKey);
    }
    
    return false;
  }

  // Method to save configuration in cache
  private static cacheConfig(dbType: string, config: IDatabaseConfig): void {
    const cacheKey = this.getCacheKey(dbType, config);
    this.configCache.set(cacheKey, {
      config: { ...config },
      timestamp: Date.now()
    });
  }

  static async configureDatabase(dbType: string): Promise<IDatabaseConfig> {
    const provider = this.providers.get(dbType);
    if (!provider) {
      throw new Error(`Unsupported database provider: ${dbType}`);
    }
    const config: IDatabaseConfig = {};

    console.log(chalk.bgCyan.black(` 🗄️  ${dbType.toUpperCase()} CONFIGURATION `));
    console.log("");
    console.log(chalk.cyan(`   Configuring connection to ${dbType.toUpperCase()}...`));
    console.log("");

    // Request configuration based on database type
    if (dbType === "mysql" || dbType === "postgresql") {
      console.log(chalk.gray("   📝 Enter connection details:"));
      console.log("");
      //call to configBDRelational function
      const answers = await configBDRelational(dbType);

      config.host = answers.host;
      config.port = parseInt(answers.port);
      config.user = answers.user;
      config.password = answers.password;
      config.database = answers.database;

    } else if (dbType === "mongodb") {
      console.log(chalk.gray("   📝 Enter connection URL:"));
      console.log("");
      //call to configBDNoSQL function
      const answers = await configBDNoSQL();

      config.url = answers.url;
    }

    // Validate configuration
    if (!provider.validateConfig(config)) {
      throw new Error("Invalid database configuration");
    }

    return config;
  }

  // Optimized method for quick connection validation with improved UI
  static async validateDatabaseConnection(dbType: string, config: IDatabaseConfig): Promise<boolean> {
    // Check cache first
    if (this.isConfigCached(dbType, config)) {
      console.log(chalk.green("   ✅ Connection validated (cached)"));
      return true;
    }

    const provider = this.providers.get(dbType);
    if (!provider) {
      return false;
    }

    console.log("");
    console.log(chalk.yellow("   🔄 Validating database connection..."));
    console.log("");

    // Spinner to show progress
    const spinner = ora({
      text: chalk.blue("   Connecting to database..."),
      color: "blue"
    }).start();

    let isValid = false;

    try {
      // First, check connection and create database if needed
      if ('checkConnectionAndCreateDB' in provider && typeof provider.checkConnectionAndCreateDB === 'function') {
        const result = await (provider as any).checkConnectionAndCreateDB(config);
        
        if (result.success) {
          // Connection successful and database ready
          isValid = true;
        } else {
          // Connection failed, show error
          spinner.fail(chalk.red("   ❌ Connection failed"));
          console.log(chalk.red(`   💡 Error: ${result.error}`));
          return false;
        }
      } else {
        // Fallback: use old validation method
        if ('validateConnection' in provider && typeof provider.validateConnection === 'function') {
          isValid = await (provider as any).validateConnection(config);
        } else {
          // Fallback: create temporary instance to validate
          const db = provider.createDatabase(config);
          await db.connect();
          await db.disconnect();
          isValid = true;
        }
      }

      if (isValid) {
        spinner.succeed(chalk.green("   ✅ Connection successful"));
        console.log(chalk.green(`   🗄️  ${dbType.toUpperCase()} database configured successfully`));
        
        // Save to cache if validation was successful
        this.cacheConfig(dbType, config);
      } else {
        spinner.fail(chalk.red("   ❌ Connection failed"));
      }
    } catch (error) {
      spinner.fail(chalk.red("   ❌ Connection error"));
      console.log(chalk.red(`   💡 Error: ${error}`));
    }

    console.log("");
    return isValid;
  }

  static getProvider(dbType: string): IDatabaseProvider | undefined {
    return this.providers.get(dbType);
  }

  static getSupportedDatabases(): string[] {
    return Array.from(this.providers.keys());
  }
}
