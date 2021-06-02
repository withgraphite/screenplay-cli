import chalk from "chalk";

export function logError(msg: string) {
  console.log(chalk.redBright(`ERROR: ${msg}`));
}

export function logWarn(msg: string) {
  console.log(chalk.yellow(`WARNING: ${msg}`));
}

export function logInfo(msg: string) {
  console.log(chalk.blueBright(`${msg}`));
}

export function logSuccess(msg: string) {
  console.log(chalk.green(`${msg}`));
}
