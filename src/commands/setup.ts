import { execSync } from 'child_process';

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
  const args = ['npx', 'skills', 'add', 'syxs/tavily-cli'];

  if (options.global) args.push('--global');
  if (options.agent) args.push('--agent', options.agent);

  const cmd = args.join(' ');
  console.log(`Running: ${cmd}\n`);

  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch {
    process.exit(1);
  }
}

async function installMcp(options: SetupOptions): Promise<void> {
  const args = [
    'npx',
    'add-mcp',
    '"npx -y mcp-remote https://mcp.tavily.com/mcp"',
    '--name',
    'tavily',
  ];

  if (options.global) args.push('--global');
  if (options.agent) args.push('--agent', options.agent);

  const cmd = args.join(' ');
  console.log(`Running: ${cmd}\n`);

  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch {
    process.exit(1);
  }
}
