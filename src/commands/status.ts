import packageJson from '../../package.json';
import { getApiKey } from '../utils/config';
import { loadCredentials } from '../utils/credentials';

function getAuthSource(): 'env' | 'stored' | 'none' {
  if (process.env.TAVILY_API_KEY) return 'env';
  if (loadCredentials()?.apiKey) return 'stored';
  return 'none';
}

export async function handleStatusCommand(): Promise<void> {
  const source = getAuthSource();
  const authenticated = !!getApiKey();

  const green = '\x1b[32m';
  const red = '\x1b[31m';
  const orange = '\x1b[38;5;208m';
  const dim = '\x1b[2m';
  const reset = '\x1b[0m';

  console.log('');
  console.log(
    `  ${orange}🔎 ${reset}tavily ${dim}cli${reset} ${dim}v${packageJson.version}${reset}`
  );
  console.log('');

  if (!authenticated) {
    console.log(`  ${red}●${reset} Not authenticated`);
    console.log(`  ${dim}Run: tavily login${reset}\n`);
    return;
  }

  const sourceLabel =
    source === 'env' ? 'via TAVILY_API_KEY' : 'via stored credentials';
  console.log(`  ${green}●${reset} Authenticated ${dim}${sourceLabel}${reset}`);
  console.log('');
}
