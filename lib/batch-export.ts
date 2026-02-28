import JSZip from "jszip";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import React from "react";
import PDFReport from "@/components/exams/PDFReport";
import { type Exam, type Student, type Grade } from "./db";

/**
 * Generates all individual PDF reports for an exam and packages them into a single ZIP file.
 * 
 * @param exam The current exam session
 * @param students List of students enrolled in the exam
 * @param grades List of all grade records for these students
 * @param onProgress Callback to update generation progress (0-100)
 */
export async function generateAllReportsAsZip(
  exam: Exam,
  students: Student[],
  grades: Grade[],
  onProgress: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(`Rapports_${exam.label}`);

  if (!folder) throw new Error("Impossible de créer le dossier ZIP.");

  let completedCount = 0;
  const totalCount = students.length;

  for (const student of students) {
    try {
      // 1. Filter grades for this student only
      const studentGrades = grades.filter((g) => g.studentId === student.id && g.examId === exam.id);

      // 2. Render PDF to Blob
      // We cast to any here because react-pdf's pdf() typing for React elements 
      // is sometimes incompatible with the way Next.js/React 18 generates elements.
      const doc = React.createElement(PDFReport, { exam, student, grades: studentGrades }) as any;
      const blob = await pdf(doc as React.ReactElement<DocumentProps>).toBlob();

      // 3. Add to ZIP folder
      const filename = `${student.lastName}_${student.firstName}_Rapport.pdf`.replace(/\s+/g, "_");
      folder.file(filename, blob);

      // 4. Update progress
      completedCount++;
      onProgress(Math.round((completedCount / totalCount) * 100));
    } catch (error) {
      console.error(`Erreur lors de la génération du PDF pour ${student.lastName}:`, error);
      // Continue with others even if one fails
    }
  }

  // 5. Generate final ZIP
  return await zip.generateAsync({ type: "blob" });
}

/**
 * Triggers a download of the generated ZIP file
 */
export function downloadZip(blob: Blob, examLabel: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `PEQ_Reports_${examLabel.replace(/\s+/g, "_")}_${timestamp}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
