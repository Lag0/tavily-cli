import { runCommandOrExit } from '../utils/process';
import packageJson from '../../package.json';

export type SetupSubcommand = 'skills' | 'mcp';

export interface SetupOptions {
  global?: boolean;
  agent?: string;
}

const SKILLS_NPX_PACKAGE = 'skills@1.4.1';
const ADD_MCP_NPX_PACKAGE = 'add-mcp@1.2.2';
const MCP_REMOTE_VERSION = '0.1.38';
const SKILL_SOURCE = `https://github.com/lag0/tavily-cli/tree/v${packageJson.version}`;

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
  const args = [SKILLS_NPX_PACKAGE, 'add', SKILL_SOURCE];

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
    ADD_MCP_NPX_PACKAGE,
    `npx -y mcp-remote@${MCP_REMOTE_VERSION} https://mcp.tavily.com/mcp`,
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
