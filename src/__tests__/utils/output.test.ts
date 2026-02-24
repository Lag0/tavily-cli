import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { writeObjectOutput, writeOutput } from '../../utils/output';

describe('output utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes plain output to file', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tavily-cli-output-'));
    const file = path.join(tmp, 'out.txt');

    writeOutput('hello', file, true);

    expect(fs.readFileSync(file, 'utf-8')).toBe('hello');
  });

  it('serializes object as json when output path ends with .json', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tavily-cli-output-'));
    const file = path.join(tmp, 'out.json');

    writeObjectOutput({ ok: true }, { output: file, pretty: false });

    expect(fs.readFileSync(file, 'utf-8')).toBe('{"ok":true}');
  });
});
