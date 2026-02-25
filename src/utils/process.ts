import { spawnSync } from 'child_process';

interface RunCommandOptions {
  command: string;
  args: string[];
  failureMessage: string;
  printCommand?: boolean;
}

function resolveExecutable(command: string): string {
  return process.platform === 'win32' ? `${command}.cmd` : command;
}

function quoteArg(arg: string): string {
  if (/^[a-zA-Z0-9._/:=-]+$/.test(arg)) return arg;
  return JSON.stringify(arg);
}

export function runCommandOrExit(options: RunCommandOptions): void {
  const { command, args, failureMessage, printCommand } = options;

  if (printCommand) {
    const printable = [command, ...args.map(quoteArg)].join(' ');
    console.log(`Running: ${printable}\n`);
  }

  const result = spawnSync(resolveExecutable(command), args, {
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    console.error(`${failureMessage} (${result.error.message})`);
    process.exit(1);
  }

  if (result.status !== 0) {
    const status = result.status ?? 1;
    console.error(`${failureMessage} (exit code ${status}).`);
    process.exit(status);
  }
}
