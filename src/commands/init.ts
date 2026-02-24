import { execSync } from 'child_process';
import { getApiKey, updateConfig } from '../utils/config';
import { saveCredentials } from '../utils/credentials';

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
    printStep('Installing @syxs/tavily-cli globally...');
    try {
      execSync('npm install -g @syxs/tavily-cli', { stdio: 'inherit' });
      console.log('✓ CLI installed\n');
    } catch {
      console.error('Failed to install @syxs/tavily-cli globally.');
      process.exit(1);
    }
  }

  if (!options.skipAuth) {
    printStep('Configuring authentication...');

    const apiKey = options.apiKey || getApiKey();
    if (!apiKey) {
      console.error(
        'No API key available. Use --api-key in init or run tavily login later.'
      );
      process.exit(1);
    }

    saveCredentials({ apiKey });
    updateConfig({ apiKey });
    console.log('✓ Authenticated\n');
  }

  if (!options.skipSkills) {
    printStep('Installing tavily skill...');

    const args = ['npx', '-y', 'skills', 'add', 'syxs/tavily-cli'];

    if (options.all) args.push('--all');
    if (options.yes || options.all) args.push('--yes');
    if (options.global) args.push('--global');
    if (options.agent) args.push('--agent', options.agent);

    try {
      execSync(args.join(' '), { stdio: 'inherit' });
      console.log('✓ Skill installed\n');
    } catch {
      console.error(
        'Failed to install skills. You can retry with: tavily setup skills'
      );
      process.exit(1);
    }
  }

  console.log('Setup complete. Run tavily --help to get started.');
}
