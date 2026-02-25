import { runCommandOrExit } from '../utils/process';

export type SetupSubcommand = 'skills' | 'mcp';

export interface SetupOptions {
  global?: boolean;
  agent?: string;
}

export async function handleSetupCommand(
  subcommand: SetupSubcommand,
  options: SetupOptions = {}
): Promise<void> {
  if (subcommand === 'skills') {
    await installSkills(options);
    return;
  }

  if (subcommand === 'mcp') {
    await installMcp(options);
    return;
  }

  console.error(`Unknown setup subcommand: ${subcommand}`);
  process.exit(1);
}

async function installSkills(options: SetupOptions): Promise<void> {
  const args = ['skills', 'add', 'https://github.com/lag0/tavily-cli.git'];

  if (options.global) args.push('--global');
  if (options.agent) args.push('--agent', options.agent);

  runCommandOrExit({
    command: 'npx',
    args,
    failureMessage:
      'Failed to install Tavily skill. You can retry with: tavily setup skills',
    printCommand: true,
  });
}

async function installMcp(options: SetupOptions): Promise<void> {
  const args = [
    'add-mcp',
    'npx -y mcp-remote https://mcp.tavily.com/mcp',
    '--name',
    'tavily',
  ];

  if (options.global) args.push('--global');
  if (options.agent) args.push('--agent', options.agent);

  runCommandOrExit({
    command: 'npx',
    args,
    failureMessage:
      'Failed to install Tavily MCP. You can retry with: tavily setup mcp',
    printCommand: true,
  });
}
