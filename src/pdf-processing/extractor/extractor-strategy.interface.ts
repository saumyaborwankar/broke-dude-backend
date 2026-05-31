import { ExtractedRow } from '../interfaces/extracted-row.interface';

export interface ExtractorStrategy {
  readonly name: string;
  extractTables(buffer: Buffer): Promise<ExtractedRow[]>;
}
