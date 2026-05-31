import { execFile } from 'child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { promisify } from 'util';
import type { ExtractorStrategy } from '../extractor-strategy.interface';
import { ExtractedRow } from '../../interfaces/extracted-row.interface';

const execFileAsync = promisify(execFile);

const SCRIPT_PATH = resolve(process.cwd(), 'scripts', 'extract_tables.py');

export class PdfPlumberExtractorStrategy implements ExtractorStrategy {
  readonly name = 'pdfplumber';

  async extractTables(buffer: Buffer): Promise<ExtractedRow[]> {
    const tmpDir = mkdtempSync(join(tmpdir(), 'pdfplumber-'));
    const tmpPath = join(tmpDir, 'upload.pdf');
    writeFileSync(tmpPath, buffer);

    try {
      const { stdout, stderr } = await execFileAsync(
        'python3',
        [SCRIPT_PATH, tmpPath],
        {
          timeout: 30_000,
          maxBuffer: 10 * 1024 * 1024,
        },
      );

      if (stderr) {
        console.warn('[PdfPlumberExtractorStrategy] stderr:', stderr);
      }

      const parsed = JSON.parse(stdout) as ExtractedRow[] | { error: string };

      if ('error' in parsed) {
        throw new Error(`PdfPlumber extraction failed: ${parsed.error}`);
      }

      return parsed;
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}
