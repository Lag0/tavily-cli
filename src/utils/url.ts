export function isUrl(value: string): boolean {
  try {
    const candidate = value.startsWith('http') ? value : `https://${value}`;
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();
    const hasDot = hostname.includes('.');
    const isLocalhost = hostname === 'localhost';
    const isIpv4 =
      /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/.test(
        hostname
      );
    const isIpv6 = hostname.includes(':');
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';

    return isHttp && (hasDot || isLocalhost || isIpv4 || isIpv6);
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
