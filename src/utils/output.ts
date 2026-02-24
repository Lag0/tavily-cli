import * as fs from 'fs';
import * as path from 'path';

function shouldOutputJson(outputPath?: string, json?: boolean): boolean {
  if (json) return true;
  return !!outputPath && outputPath.toLowerCase().endsWith('.json');
}

export function writeOutput(
  content: string,
  outputPath?: string,
  silent = false
): void {
  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, content, 'utf-8');
    if (!silent) {
      console.error(`Output written to: ${outputPath}`);
    }
    return;
  }

  if (!content.endsWith('\n')) {
    content += '\n';
  }

  process.stdout.write(content);
}

export function writeObjectOutput(
  data: unknown,
  options: { output?: string; json?: boolean; pretty?: boolean }
): void {
  const forceJson = shouldOutputJson(options.output, options.json);

  if (forceJson) {
    writeOutput(
      options.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data),
      options.output,
      !!options.output
    );
    return;
  }

  if (typeof data === 'string') {
    writeOutput(data, options.output, !!options.output);
    return;
  }

  writeOutput(
    options.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data),
    options.output,
    !!options.output
  );
}
