import type { Command } from 'commander';
import { handleInitCommand } from '../init';
import { handleSetupCommand, type SetupSubcommand } from '../setup';
import { handleEnvPullCommand } from '../env';

export function registerToolingCommands(program: Command): void {
  program
    .command('init')
    .description(
      'Install CLI globally, configure auth, and install skills in one step (npx -y @syxs/tavily-cli init)'
    )
    .option('--all', 'Install skills to all detected agents (implies --yes)')
    .option('-y, --yes', 'Skip confirmation prompts for skills installation')
    .option('-g, --global', 'Install skills globally (user-level)')
    .option('-a, --agent <agent>', 'Install skills to a specific agent')
    .option('-k, --api-key <key>', 'Authenticate with this API key')
    .option('--skip-install', 'Skip global CLI installation')
    .option('--skip-auth', 'Skip authentication')
    .option('--skip-skills', 'Skip skills installation')
    .action(async (options) => {
      await handleInitCommand({
        all: options.all,
        yes: options.yes,
        global: options.global,
        agent: options.agent,
        apiKey: options.apiKey,
        skipInstall: options.skipInstall,
        skipAuth: options.skipAuth,
        skipSkills: options.skipSkills,
      });
    });

  program
    .command('setup')
    .description('Set up individual Tavily integrations (skills, mcp)')
    .argument('<subcommand>', 'What to set up: skills or mcp')
    .option('-g, --global', 'Install globally (user-level)')
    .option('-a, --agent <agent>', 'Install to a specific agent')
    .action(async (subcommand: SetupSubcommand, options) => {
      await handleSetupCommand(subcommand, options);
    });

  program
    .command('env')
    .description('Pull TAVILY_API_KEY into a local .env file')
    .option('-f, --file <path>', 'Target env file (default: .env)')
    .option('--overwrite', 'Overwrite existing TAVILY_API_KEY if present')
    .action(async (options) => {
      await handleEnvPullCommand({
        file: options.file,
        overwrite: options.overwrite,
      });
    });
}
