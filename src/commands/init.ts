import { getApiKey, updateConfig } from '../utils/config';
import { saveCredentials } from '../utils/credentials';
import { runCommandOrExit } from '../utils/process';

export interface InitOptions {
  global?: boolean;
  agent?: string;
  all?: boolean;
  yes?: boolean;
  skipInstall?: boolean;
  skipSkills?: boolean;
  skipAuth?: boolean;
  apiKey?: string;
}

const SKILLS_NPX_PACKAGE = 'skills@1.4.1';
const SKILL_SOURCE = 'https://github.com/lag0/tavily-cli/tree/main';
const CLI_PACKAGE = '@syxs/tavily-cli@latest';

export async function handleInitCommand(
  options: InitOptions = {}
): Promise<void> {
  const steps: string[] = [];
  if (!options.skipInstall) steps.push('install');
  if (!options.skipAuth) steps.push('auth');
  if (!options.skipSkills) steps.push('skills');

  let index = 0;
  const printStep = (message: string): void => {
    index += 1;
    console.log(`[${index}/${steps.length}] ${message}`);
  };

  if (!options.skipInstall) {
    printStep(`Installing ${CLI_PACKAGE} globally...`);
    runCommandOrExit({
      command: 'npm',
      args: ['install', '-g', CLI_PACKAGE],
      failureMessage: 'Failed to install @syxs/tavily-cli globally',
    });
    console.log('✓ CLI installed\n');
  }

  if (!options.skipAuth) {
    printStep('Configuring authentication...');

    const apiKey = options.apiKey || getApiKey();
    if (!apiKey) {
      console.error(
        'No API key available. Set TAVILY_API_KEY, use --api-key in init, or run tavily login later.'
      );
      process.exit(1);
    }

    saveCredentials({ apiKey });
    updateConfig({ apiKey });
    console.log('✓ Authenticated\n');
  }

  if (!options.skipSkills) {
    printStep('Installing tavily skill...');

    const args = ['npx', '-y', SKILLS_NPX_PACKAGE, 'add', SKILL_SOURCE];
    const command = args.shift() as string;

    if (options.all) args.push('--all');
    if (options.yes || options.all) args.push('--yes');
    if (options.global) args.push('--global');
    if (options.agent) args.push('--agent', options.agent);

    runCommandOrExit({
      command,
      args,
      failureMessage:
        'Failed to install skills. You can retry with: tavily setup skills',
    });
    console.log('✓ Skill installed\n');
  }

  console.log('Setup complete. Run tavily --help to get started.');
}
