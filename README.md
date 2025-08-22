# 🗄️ Laiyon Database

[![npm version](https://img.shields.io/npm/v/laiyon-database.svg)](https://www.npmjs.com/package/@laiyon/database)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)

A robust and flexible system for configuring and managing databases with native support for **MongoDB**, **MySQL** and **PostgreSQL**. Developed in TypeScript with an intuitive API.

## ✨ Features

- 🔌 **Multi-Database Support**: MongoDB, MySQL and PostgreSQL
- 🎯 **TypeScript First**: Fully typed with robust interfaces
- 🚀 **Interactive Configuration**: Interactive CLI for database setup
- ✅ **Automatic Validation**: Connection and configuration verification
- 💾 **Cache System**: Performance optimization with intelligent caching
- 🔒 **Security**: Configuration validation and secure credential handling

## 🚀 Quick Start

```bash
npm install laiyon-database
```

```typescript
import { DatabaseConfigService, MySQLProvider } from 'laiyon-database';

// Configure and validate MySQL
const config = await DatabaseConfigService.configureDatabase('mysql');
const isValid = await DatabaseConfigService.validateDatabaseConnection('mysql', config);

if (isValid) {
  const mysqlProvider = new MySQLProvider();
  const database = mysqlProvider.createDatabase(config);
  await database.connect();
  console.log('✅ Connected to MySQL');
}
```

## 🏗️ Architecture

```typescript
interface IDatabaseConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  url?: string; // For MongoDB
}

interface IDatabase {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConfig(): IDatabaseConfig;
}
```

## 🔧 Configuration

Create a `.env` file:

```env
# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=myapp

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=myapp

# MongoDB
MONGODB_URL=mongodb://localhost:27017/myapp
```


## 📄 License

This project is under the MIT License.

## 👨‍💻 Team

**Team Laiyon** - [juanalvarez.pro](https://juanalvarez.pro)

---

⭐ **Don't forget to give the project a star if you find it useful!**
