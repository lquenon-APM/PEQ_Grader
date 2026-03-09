// Grid CSV Parser — Story 8.1

export interface GridParseError {
  lineNumber: number;
  line: string;
  message: string;
}

export interface ParsedGridResult {
  gridStructure: {
    competencies: Array<{
      id: string;
      label: string;
      indicators: Array<{
        id: string;
        text: string;
        critical: boolean;
      }>;
    }>;
  };
  errors: GridParseError[];
  validLineCount: number;
  invalidLineCount: number;
}

/**
 * Auto-detect separator by counting occurrences of `;` vs `,` in the first non-empty line.
 */
function detectSeparator(firstLine: string): string {
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semicolons >= commas ? ";" : ",";
}

const HEADER_PATTERNS = ["competency", "indicator", "critical", "compétence", "indicateur", "critique"];

/**
 * Check if a row looks like a header row (case-insensitive match against known column names).
 */
function isHeaderRow(fields: string[]): boolean {
  const normalized = fields.map((f) => f.trim().toLowerCase());
  return normalized.some((f) => HEADER_PATTERNS.includes(f));
}

const TRUTHY_VALUES = new Set(["true", "1", "oui", "yes"]);
const FALSY_VALUES = new Set(["false", "0", "non", "no"]);

/**
 * Parse a critical flag value. Returns `false` if empty/missing.
 */
function parseCritical(value: string | undefined): boolean {
  if (!value || value.trim() === "") return false;
  const normalized = value.trim().toLowerCase();
  if (TRUTHY_VALUES.has(normalized)) return true;
  if (FALSY_VALUES.has(normalized)) return false;
  return false;
}

/**
 * Parse CSV text into a Grid structure.
 */
export function parseGridCSV(
  text: string,
  options?: { separator?: string }
): ParsedGridResult {
  const errors: GridParseError[] = [];
  let validLineCount = 0;
  let invalidLineCount = 0;

  // Normalize line endings and split
  const allLines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  // Filter out completely empty/whitespace-only lines (but track original line numbers)
  const lines: { text: string; lineNumber: number }[] = [];
  for (let i = 0; i < allLines.length; i++) {
    if (allLines[i].trim() !== "") {
      lines.push({ text: allLines[i], lineNumber: i + 1 });
    }
  }

  if (lines.length === 0) {
    return {
      gridStructure: { competencies: [] },
      errors: [],
      validLineCount: 0,
      invalidLineCount: 0,
    };
  }

  // Detect or use provided separator
  const separator = options?.separator ?? detectSeparator(lines[0].text);

  // Check for header row
  let startIndex = 0;
  const firstFields = lines[0].text.split(separator).map((s) => s.trim());
  if (isHeaderRow(firstFields)) {
    startIndex = 1;
  }

  // Group competencies using a Map (preserves insertion order)
  const competencyMap = new Map<
    string,
    {
      id: string;
      label: string;
      indicators: Array<{ id: string; text: string; critical: boolean }>;
    }
  >();

  for (let i = startIndex; i < lines.length; i++) {
    const { text: lineText, lineNumber } = lines[i];
    const fields = lineText.split(separator).map((s) => s.trim());

    const competencyLabel = fields[0] ?? "";
    const indicatorText = fields[1] ?? "";
    const criticalRaw = fields[2];

    // Validation
    let hasError = false;

    if (competencyLabel === "") {
      errors.push({
        lineNumber,
        line: lineText,
        message: "Le nom de la compétence est vide",
      });
      hasError = true;
    }

    if (indicatorText === "") {
      errors.push({
        lineNumber,
        line: lineText,
        message: "Le texte de l'indicateur est vide",
      });
      hasError = true;
    }

    if (hasError) {
      invalidLineCount++;
      continue;
    }

    // Valid line — add to structure
    validLineCount++;
    const critical = parseCritical(criticalRaw);

    if (!competencyMap.has(competencyLabel)) {
      competencyMap.set(competencyLabel, {
        id: crypto.randomUUID(),
        label: competencyLabel,
        indicators: [],
      });
    }

    competencyMap.get(competencyLabel)!.indicators.push({
      id: crypto.randomUUID(),
      text: indicatorText,
      critical,
    });
  }

  return {
    gridStructure: {
      competencies: Array.from(competencyMap.values()),
    },
    errors,
    validLineCount,
    invalidLineCount,
  };
}
