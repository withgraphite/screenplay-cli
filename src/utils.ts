import chalk from "chalk";

export function error(msg: string): never {
  console.log(chalk.yellow(`ERROR: ${msg}`));
  process.exit(1);
}

export function warn(msg: string) {
  console.log(chalk.yellow(`WARNING: ${msg}`));
}
