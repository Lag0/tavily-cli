import type { Command } from 'commander';
import { handleLoginCommand } from '../login';
import { handleLogoutCommand } from '../logout';
import { handleStatusCommand } from '../status';

export function registerAuthCommands(program: Command): void {
  program
    .command('login')
    .description('Login with Tavily API key (interactive, env, or --api-key)')
    .option('-k, --api-key <key>', 'Tavily API key')
    .option('--api-url <url>', 'API URL (default: https://api.tavily.com)')
    .action(async (options, command) => {
      const globalOptions = command.parent?.opts() ?? {};

      await handleLoginCommand({
        apiKey: options.apiKey || globalOptions.apiKey,
        apiUrl: options.apiUrl || globalOptions.apiUrl,
      });
    });

  program
    .command('logout')
    .description('Logout and clear stored credentials')
    .action(async () => {
      await handleLogoutCommand();
    });

  program
    .command('status')
    .description('Show version and authentication status')
    .action(async () => {
      await handleStatusCommand();
    });
}
