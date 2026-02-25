import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface StoredCredentials {
  apiKey?: string;
  apiUrl?: string;
}

let hasWarnedInvalidCredentials = false;

function getConfigDir(): string {
  const home = os.homedir();
  const platform = os.platform();

  if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'tavily-cli');
  }

  if (platform === 'win32') {
    return path.join(home, 'AppData', 'Roaming', 'tavily-cli');
  }

  return path.join(home, '.config', 'tavily-cli');
}

function getCredentialsPath(): string {
  return path.join(getConfigDir(), 'credentials.json');
}

function ensureConfigDir(): void {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
}

function setSecurePermissions(filePath: string): void {
  try {
    fs.chmodSync(filePath, 0o600);
  } catch {
    // Ignore on unsupported platforms.
  }
}

export function loadCredentials(): StoredCredentials | null {
  const file = getCredentialsPath();

  try {
    if (!fs.existsSync(file)) {
      return null;
    }

    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw) as StoredCredentials;
  } catch {
    if (!hasWarnedInvalidCredentials) {
      hasWarnedInvalidCredentials = true;
      console.error(
        `Warning: Unable to read credentials at ${file}. Run "tavily logout" then login again.`
      );
    }
    return null;
  }
}

export function saveCredentials(credentials: StoredCredentials): void {
  ensureConfigDir();
  const file = getCredentialsPath();
  const existing = loadCredentials() ?? {};

  fs.writeFileSync(
    file,
    JSON.stringify({ ...existing, ...credentials }, null, 2),
    'utf-8'
  );
  setSecurePermissions(file);
}

export function deleteCredentials(): void {
  const file = getCredentialsPath();
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
}

export function getConfigDirectoryPath(): string {
  return getConfigDir();
}
