import { deleteCredentials } from '../utils/credentials';
import { updateConfig } from '../utils/config';

export async function handleLogoutCommand(): Promise<void> {
  deleteCredentials();
  updateConfig({ apiKey: undefined });
  console.log('Logged out and local credentials removed.');
}
