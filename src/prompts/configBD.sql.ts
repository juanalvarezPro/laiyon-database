import chalk from "chalk";import inquirer from "inquirer";

export const configBDRelational = async (dbType: string) => {
    
const configBD = await inquirer.prompt([
    {
      type: "input",
      name: "host",
      message: chalk.blue("🏠 Database host:"),
      default: "localhost"
    },
    {
      type: "input",
      name: "port",
      message: chalk.blue("🔌 Port:"),
      default: dbType === "mysql" ? "3306" : "5432"
    },
    {
      type: "input",
      name: "user",
      message: chalk.blue("👤 Username:"),
      default: "root"
    },
    {
      type: "password",
      name: "password",
      message: chalk.blue("🔒 Password:")
    },
    {
      type: "input",
      name: "database",
      message: chalk.blue("📁 Database name:"),
      default: "laiyonWasapi_db"
    }
  ]);

  return configBD;
}