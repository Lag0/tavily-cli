export function isUrl(value: string): boolean {
  try {
    const candidate = value.startsWith('http') ? value : `https://${value}`;
    const url = new URL(candidate);
    return !!url.hostname;
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string): string {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `https://${value}`;
}
