"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface ParsedStudent {
  firstName: string;
  lastName: string;
  group: string;
  valid: boolean;
  lineNumber: number;
}

interface CSVImporterProps {
  onClose: () => void;
}

export default function CSVImporter({ onClose }: CSVImporterProps) {
  const [previewData, setPreviewData] = useState<ParsedStudent[]>([]);
  const [importing, setImporting] = useState(false);

  const parseCSV = (text: string): ParsedStudent[] => {
    const lines = text.trim().split("\n");
    return lines.map((line, index) => {
      const [firstName, lastName, group] = line.split(",").map((s) => s.trim());
      return {
        firstName: firstName || "",
        lastName: lastName || "",
        group: group || "",
        valid: Boolean(firstName && lastName && group),
        lineNumber: index + 1,
      };
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setPreviewData(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validStudents = previewData.filter((s) => s.valid);

    if (validStudents.length === 0) {
      alert("No valid students to import");
      return;
    }

    setImporting(true);

    try {
      const students = validStudents.map((s) => ({
        id: crypto.randomUUID(),
        firstName: s.firstName,
        lastName: s.lastName,
        group: s.group,
      }));

      await db.students.bulkAdd(students);
      alert(`Successfully imported ${students.length} student(s)`);
      onClose();
    } catch (error) {
      console.error("Error importing students:", error);
      alert("Failed to import students. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const validCount = previewData.filter((s) => s.valid).length;
  const invalidCount = previewData.length - validCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Import Students from CSV</h2>
            <p className="text-slate-600 text-sm mt-1">
              Format: firstName, lastName, group (one student per line)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* File Upload */}
          {previewData.length === 0 ? (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
              <Upload size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Upload CSV File
              </h3>
              <p className="text-slate-600 mb-4">
                Select a CSV file with student data
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer active:scale-95 transition-all">
                <Upload size={20} />
                <span>Choose File</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <div className="mt-6 p-4 bg-slate-50 rounded-lg text-left max-w-md mx-auto">
                <p className="text-sm font-semibold mb-2">Example CSV format:</p>
                <code className="text-xs text-slate-700 block">
                  John, Doe, A1<br />
                  Jane, Smith, B2<br />
                  Bob, Johnson, A1
                </code>
              </div>
            </div>
          ) : (
            <>
              {/* Preview Stats */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                  <CheckCircle size={20} />
                  <span className="font-semibold">{validCount} Valid</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg">
                    <AlertCircle size={20} />
                    <span className="font-semibold">{invalidCount} Invalid</span>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Line
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        First Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Last Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Group
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((student, index) => (
                      <tr
                        key={index}
                        className={student.valid ? "" : "bg-rose-50"}
                      >
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {student.lineNumber}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {student.firstName || (
                            <span className="text-slate-400 italic">empty</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {student.lastName || (
                            <span className="text-slate-400 italic">empty</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {student.group || (
                            <span className="text-slate-400 italic">empty</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {student.valid ? (
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

              {/* Retry Upload */}
              <div className="mt-4">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer active:scale-95 transition-all">
                  <Upload size={16} />
                  <span>Choose Different File</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {previewData.length > 0 && (
          <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={validCount === 0 || importing}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing
                ? "Importing..."
                : `Import ${validCount} Student${validCount !== 1 ? "s" : ""}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
