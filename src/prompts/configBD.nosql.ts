import chalk from "chalk";
import inquirer from "inquirer";

export const configBDNoSQL = async () => {
    const mongoDB = await inquirer.prompt([
    {
      type: "input",
      name: "url",
      message: chalk.blue("🔗 MongoDB connection URL:"),
      default: "mongodb://localhost:27017/laiyonWasapi_db"
    }
  ]);

  return mongoDB;
}