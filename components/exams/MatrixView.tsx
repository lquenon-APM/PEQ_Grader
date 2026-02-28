"use client";

import { useState } from "react";
import { type Exam, type Grade, type Student, db } from "@/lib/db";
import { Check, X, AlertCircle, Clock, Lock, FileText, Unlock, Download, Archive, Loader2 } from "lucide-react";
import GradingModal from "./GradingModal";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PDFReport from "./PDFReport";
import { generateAllReportsAsZip, downloadZip } from "@/lib/batch-export";

interface MatrixViewProps {
  exam: Exam;
  students: Student[];
  grades: Grade[];
}

export default function MatrixView({ exam, students, grades }: MatrixViewProps) {
  const [selectedCell, setSelectedCell] = useState<{ studentId: string; competencyId: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Helper to find a grade
  const getGrade = (studentId: string, competencyId: string) => {
    const pk = `${exam.id}+${studentId}+${competencyId}`;
    return grades.find((g) => g.pk === pk);
  };

  const isClosed = exam.status === "CLOSED";

  const handleBatchExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    try {
      const blob = await generateAllReportsAsZip(exam, students, grades, (p) => setExportProgress(p));
      downloadZip(blob, exam.label);
    } catch (error) {
      console.error("Export failed:", error);
      alert("L'exportation groupée a échoué.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Status mapping to UI
  const statusConfig = {
    PENDING: { color: "bg-slate-100 text-slate-400", icon: Clock, label: "Non commencé" },
    ACQUIS: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Check, label: "Acquis" },
    NON_ACQUIS: { color: "bg-rose-100 text-rose-700 border-rose-200", icon: X, label: "Non Acquis" },
    REMEDIATION: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertCircle, label: "Remédiation" },
  };

  const navigateStudent = (direction: "next" | "prev") => {
    if (!selectedCell) return;
    const currentIndex = students.findIndex((s) => s.id === selectedCell.studentId);
    let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < 0) nextIndex = students.length - 1;
    if (nextIndex >= students.length) nextIndex = 0;

    setSelectedCell({
      ...selectedCell,
      studentId: students[nextIndex].id,
    });
  };

  const toggleExamStatus = async () => {
    const newStatus = isClosed ? "OPEN" : "CLOSED";
    const confirmMsg = isClosed 
      ? "Réouvrir l'examen permettra de modifier les notes. Continuer ?" 
      : "Clôturer l'examen verrouillera toutes les notes. Continuer ?";
    
    if (confirm(confirmMsg)) {
      await db.exams.update(exam.id, { 
        status: newStatus,
        closedAt: newStatus === "CLOSED" ? new Date().toISOString() : undefined
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Exam Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isClosed ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
            {isClosed ? <Lock size={20} /> : <Unlock size={20} />}
          </div>
          <div>
            <h2 className="font-bold text-slate-900">{exam.label}</h2>
            <p className="text-xs text-slate-500 font-medium">Statut : {isClosed ? "Clôturé (Lecture seule)" : "Ouvert (Évaluation en cours)"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Batch Export Button */}
          <button
            onClick={handleBatchExport}
            disabled={isExporting}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 border shadow-sm ${
              isExporting 
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-wait" 
                : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50 active:scale-95"
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{exportProgress}%</span>
              </>
            ) : (
              <>
                <Archive size={16} />
                <span>Tout exporter (ZIP)</span>
              </>
            )}
          </button>

          <button
            onClick={toggleExamStatus}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              isClosed 
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                : "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100"
            }`}
          >
            {isClosed ? <Unlock size={16} /> : <Lock size={16} />}
            {isClosed ? "Réouvrir" : "Clôturer l'examen"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="sticky left-0 z-20 bg-slate-50 p-4 text-left font-bold text-slate-700 border-r border-slate-200 min-w-[220px]">
                  Élèves
                </th>
                {exam.frozenGridStructure.competencies.map((comp, idx) => (
                  <th key={comp.id} className="p-4 text-center min-w-[150px] border-r border-slate-200 last:border-r-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Critère {idx + 1}</div>
                    <div className="text-sm font-bold text-slate-700 line-clamp-1">{comp.label}</div>
                  </th>
                ))}
                <th className="p-4 text-center min-w-[100px] bg-slate-50/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="sticky left-0 z-20 bg-white border-r border-slate-200 p-4 font-semibold text-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <div className="flex flex-col">
                      <span>{student.lastName} {student.firstName}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{student.group}</span>
                    </div>
                  </td>
                  
                  {exam.frozenGridStructure.competencies.map((comp) => {
                    const grade = getGrade(student.id, comp.id);
                    const status = grade?.status || "PENDING";
                    const config = statusConfig[status];
                    const Icon = config.icon;

                    return (
                      <td key={comp.id} className="p-2 border-r border-slate-100 last:border-r-0">
                        <button
                          disabled={isClosed && status === "PENDING"}
                          onClick={() => setSelectedCell({ studentId: student.id, competencyId: comp.id })}
                          className={`w-full h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group relative ${
                            status === "PENDING" 
                              ? "border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50" 
                              : `border-transparent ${config.color}`
                          } ${isClosed && status === "PENDING" ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <Icon size={20} className={status === "PENDING" ? "group-hover:text-blue-500" : ""} />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">
                            {status === "PENDING" ? (isClosed ? "Non noté" : "Noter") : config.label}
                          </span>
                        </button>
                      </td>
                    );
                  })}

                  <td className="p-2 text-center bg-slate-50/30">
                    <PDFDownloadLink
                      document={<PDFReport exam={exam} student={student} grades={grades} />}
                      fileName={`PEQ_${student.lastName}_${exam.label}.pdf`}
                    >
                      {({ loading }) => (
                        <button 
                          className={`p-3 rounded-xl transition-all ${
                            loading ? "text-slate-300" : "text-blue-600 hover:bg-blue-50 hover:scale-110"
                          }`}
                          title="Télécharger le rapport PDF"
                        >
                          <FileText size={24} />
                        </button>
                      )}
                    </PDFDownloadLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCell && (
        <GradingModal
          exam={exam}
          student={students.find(s => s.id === selectedCell.studentId)!}
          competency={exam.frozenGridStructure.competencies.find(c => c.id === selectedCell.competencyId)!}
          grade={getGrade(selectedCell.studentId, selectedCell.competencyId)}
          onClose={() => setSelectedCell(null)}
          onNavigate={navigateStudent}
          readOnly={isClosed}
        />
      )}
    </div>
  );
}
