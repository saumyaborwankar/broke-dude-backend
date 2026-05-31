import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { ExtractorStrategy } from '../extractor-strategy.interface';
import { ExtractedRow } from '../../interfaces/extracted-row.interface';

interface PdfTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

interface PositionedText {
  str: string;
  x: number;
  y: number;
}

export class PdfJsExtractorStrategy implements ExtractorStrategy {
  readonly name = 'pdfjs';

  async extractTables(buffer: Buffer): Promise<ExtractedRow[]> {
    const data = new Uint8Array(buffer);

    const doc = await pdfjs.getDocument({ data }).promise;
    const allRows: ExtractedRow[] = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const textContent = await page.getTextContent();

      const rawItems = textContent.items as unknown as PdfTextItem[];
      const items: PositionedText[] = rawItems
        .filter((item) => item.str != null)
        .map((item) => ({
          str: item.str.trim(),
          x: item.transform[4],
          y: item.transform[5],
        }))
        .filter((item) => item.str.length > 0);

      const rows = this.groupIntoRows(items);
      const parsed = this.parseRows(rows);
      allRows.push(...parsed);
    }

    return allRows;
  }

  private groupIntoRows(
    items: PositionedText[],
    yTolerance = 3,
  ): PositionedText[][] {
    const sorted = [...items].sort((a, b) => b.y - a.y);
    const rows: PositionedText[][] = [];
    let currentRow: PositionedText[] = [];
    let currentY = sorted[0]?.y;

    for (const item of sorted) {
      if (currentY != null && Math.abs(item.y - currentY) > yTolerance) {
        if (currentRow.length > 0) {
          rows.push(currentRow.sort((a, b) => a.x - b.x));
        }
        currentRow = [item];
        currentY = item.y;
      } else {
        currentRow.push(item);
      }
    }

    if (currentRow.length > 0) {
      rows.push(currentRow.sort((a, b) => a.x - b.x));
    }

    return rows;
  }

  private parseRows(rows: PositionedText[][]): ExtractedRow[] {
    const rowsWithText = rows
      .map((row) =>
        row
          .map((item) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .filter((text) => text.length > 0);

    if (rowsWithText.length < 2) {
      return [];
    }

    const headerIdx = this.findHeaderRowIndex(rowsWithText);
    const dataRows =
      headerIdx >= 0 ? rowsWithText.slice(headerIdx + 1) : rowsWithText;

    const dateColIdx = this.guessDateColumn(rows, headerIdx);
    const descColIdx = this.guessDescriptionColumn(rows, headerIdx);
    const amountColIdx = this.guessAmountColumn(rows, headerIdx);

    const results: ExtractedRow[] = [];

    for (const rowText of dataRows) {
      const cells = rowText.split(/\s{2,}/);

      let description = '';
      let amount = 0;
      let date = '';

      if (
        cells.length >= 3 &&
        dateColIdx >= 0 &&
        descColIdx >= 0 &&
        amountColIdx >= 0
      ) {
        date = (cells[dateColIdx] ?? '').trim();
        description = (cells[descColIdx] ?? '').trim();
        amount = this.parseAmount(cells[amountColIdx]);
      } else {
        const parsed = this.fallbackParseRow(rowText);
        description = parsed.description;
        amount = parsed.amount;
        date = parsed.date;
      }

      if (!description) {
        continue;
      }

      results.push({ description, date, amount: Math.abs(amount) });
    }

    return results;
  }

  private findHeaderRowIndex(rows: string[]): number {
    const headerKeywords = [
      'description',
      'merchant',
      'transaction',
      'payee',
      'date',
      'amount',
      'debit',
      'credit',
    ];
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const lower = rows[i].toLowerCase();
      const matches = headerKeywords.filter((kw) => lower.includes(kw));
      if (matches.length >= 2) {
        return i;
      }
    }
    return -1;
  }

  private guessDateColumn(rows: PositionedText[][], headerIdx: number): number {
    return this.findColumnByPattern(rows, headerIdx, (str) =>
      /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(str),
    );
  }

  private guessDescriptionColumn(
    rows: PositionedText[][],
    headerIdx: number,
  ): number {
    return this.findColumnByPattern(
      rows,
      headerIdx,
      (str) => /[a-zA-Z]{3,}/.test(str) && !/^\d/.test(str.trim()),
    );
  }

  private guessAmountColumn(
    rows: PositionedText[][],
    headerIdx: number,
  ): number {
    return this.findColumnByPattern(rows, headerIdx, (str) =>
      /^-?\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/.test(str.trim()),
    );
  }

  private findColumnByPattern(
    rows: PositionedText[][],
    headerIdx: number,
    predicate: (s: string) => boolean,
  ): number {
    const startIdx = Math.max(0, headerIdx);
    const sampleRows = rows.slice(startIdx + 1, startIdx + 6);

    const colMatches: Map<number, number> = new Map();

    for (const row of sampleRows) {
      const rowText = row.map((i) => i.str).join(' ');
      const parts = rowText.split(/\s{2,}/);
      for (let col = 0; col < parts.length; col++) {
        if (predicate(parts[col].trim())) {
          colMatches.set(col, (colMatches.get(col) ?? 0) + 1);
        }
      }
    }

    let bestCol = -1;
    let bestCount = 0;
    for (const [col, count] of colMatches) {
      if (count > bestCount) {
        bestCol = col;
        bestCount = count;
      }
    }

    return bestCol;
  }

  private parseAmount(raw: string): number {
    const cleaned = raw.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  private fallbackParseRow(text: string): {
    description: string;
    amount: number;
    date: string;
  } {
    const dateMatch = text.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/);
    const date = dateMatch ? dateMatch[1] : '';

    const amountMatch = text.match(/(-?\d{1,3}(?:,\d{3})*(?:\.\d{2}))/);
    const amount = amountMatch ? this.parseAmount(amountMatch[1]) : 0;

    let description = text;
    if (dateMatch) {
      description = description.replace(dateMatch[1], '');
    }
    if (amountMatch) {
      description = description.replace(amountMatch[1], '');
    }
    description = description.replace(/\s{2,}/g, ' ').trim();

    return { description, amount, date };
  }
}
