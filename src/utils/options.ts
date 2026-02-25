export function parseList(value?: string): string[] | undefined {
  if (!value) return undefined;

  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
}

export function parseJsonObject(
  value?: string
): Record<string, unknown> | undefined {
  if (!value) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(
      'Invalid JSON for --output-schema. Example: --output-schema \'{"field":"value"}\''
    );
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Expected a JSON object.');
  }

  return parsed as Record<string, unknown>;
}
