"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { parseGridCSV, type ParsedGridResult } from "@/lib/grid-csv-parser";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface PreviewRow {
  lineNumber: number;
  competency: string;
  indicator: string;
  critical: string;
  valid: boolean;
}

interface GridCSVImporterProps {
  onClose: () => void;
}

/**
 * Build per-line preview rows from raw CSV text and the parsed result errors.
 */
function buildPreviewRows(
  text: string,
  result: ParsedGridResult,
  separator: string
): PreviewRow[] {
  const allLines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const errorLineNumbers = new Set(result.errors.map((e) => e.lineNumber));

  // Detect header same way as parser
  const HEADER_PATTERNS = [
    "competency",
    "indicator",
    "critical",
    "compétence",
    "indicateur",
    "critique",
  ];

  const rows: PreviewRow[] = [];

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    if (line.trim() === "") continue;

    const lineNumber = i + 1;
    const fields = line.split(separator).map((s) => s.trim());

    // Skip header row
    if (
      rows.length === 0 &&
      fields.some((f) => HEADER_PATTERNS.includes(f.toLowerCase()))
    ) {
      continue;
    }

    rows.push({
      lineNumber,
      competency: fields[0] ?? "",
      indicator: fields[1] ?? "",
      critical: fields[2] ?? "",
      valid: !errorLineNumbers.has(lineNumber),
    });
  }

  return rows;
}

function detectSeparator(firstLine: string): string {
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semicolons >= commas ? ";" : ",";
}

export default function GridCSVImporter({ onClose }: GridCSVImporterProps) {
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [parsedResult, setParsedResult] = useState<ParsedGridResult | null>(
    null
  );
  const [gridTitle, setGridTitle] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseGridCSV(text);
      setParsedResult(result);

      // Detect separator for preview row building
      const firstLine = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .find((l) => l.trim() !== "");
      const sep = firstLine ? detectSeparator(firstLine) : ";";

      setPreviewRows(buildPreviewRows(text, result, sep));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsedResult || !gridTitle.trim()) return;

    setImporting(true);
    setError(null);

    try {
      const grid = {
        id: crypto.randomUUID(),
        name: gridTitle.trim(),
        structure: parsedResult.gridStructure,
        version: 1,
      };

      await db.grids.add(grid);
      onClose();
    } catch (err) {
      console.error("Error importing grid:", err);
      setError("Échec de l'import. Veuillez réessayer.");
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedResult?.validLineCount ?? 0;
  const invalidCount = parsedResult?.invalidLineCount ?? 0;
  const canImport = validCount > 0 && gridTitle.trim() !== "" && !importing;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Importer une grille CSV</h2>
            <p className="text-slate-600 text-sm mt-1">
              Format : Compétence, Indicateur, Critique (une ligne par
              indicateur)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* File Upload — initial state */}
          {previewRows.length === 0 ? (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
              <Upload size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Téléverser un fichier CSV
              </h3>
              <p className="text-slate-600 mb-4">
                Sélectionnez un fichier CSV avec les données de la grille
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer active:scale-95 transition-all min-h-[48px]">
                <Upload size={20} />
                <span>Choisir un fichier</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <div className="mt-6 p-4 bg-slate-50 rounded-lg text-left max-w-md mx-auto">
                <p className="text-sm font-semibold mb-2">
                  Exemple de format CSV :
                </p>
                <code className="text-xs text-slate-700 block">
                  Soudage;Réalise un cordon droit;oui
                  <br />
                  Soudage;Respecte les paramètres;non
                  <br />
                  Découpe;Trace correctement;non
                </code>
              </div>
            </div>
          ) : (
            <>
              {/* Grid Title Input */}
              <div className="mb-4">
                <label
                  htmlFor="grid-title"
                  className="block text-sm font-semibold mb-1"
                >
                  Titre de la grille
                </label>
                <input
                  id="grid-title"
                  type="text"
                  value={gridTitle}
                  onChange={(e) => setGridTitle(e.target.value)}
                  placeholder="Titre de la grille (ex: Soudure CQ6 - Juin 2026)"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
                />
              </div>

              {/* Summary Bar */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                  <CheckCircle size={20} />
                  <span className="font-semibold">{validCount} Valid</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg">
                    <AlertCircle size={20} />
                    <span className="font-semibold">
                      {invalidCount} Invalid
                    </span>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-auto max-h-[40vh]">
                  <table className="w-full">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Line
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Competency
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Indicator
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Critical
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row) => (
                        <tr
                          key={row.lineNumber}
                          className={row.valid ? "" : "bg-rose-50"}
                        >
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {row.lineNumber}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {row.competency || (
                              <span className="text-slate-400 italic">
                                empty
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {row.indicator || (
                              <span className="text-slate-400 italic">
                                empty
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {row.critical || (
                              <span className="text-slate-400 italic">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {row.valid ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle size={16} />
                                Valid
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-rose-600">
                                <AlertCircle size={16} />
                                Invalid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Choose Different File */}
              <div className="mt-4">
                <label className="inline-flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer active:scale-95 transition-all min-h-[48px]">
                  <Upload size={16} />
                  <span>Choisir un autre fichier</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {previewRows.length > 0 && (
          <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-95 transition-all min-h-[48px]"
            >
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={!canImport}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {importing
                ? "Import en cours..."
                : `Importer ${validCount} ligne${validCount !== 1 ? "s" : ""}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
