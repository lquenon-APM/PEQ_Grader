"use client";

import { useState, useEffect, useMemo } from "react";
import { type Exam, type Grade, type Student, db } from "@/lib/db";
import { X, Check, Award, MessageSquare, Save, AlertCircle, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { calculateSuggestedStatus } from "@/lib/logic";

interface GradingModalProps {
  exam: Exam;
  student: Student;
  competency: any; 
  grade?: Grade;
  onClose: () => void;
  onNavigate?: (direction: "next" | "prev") => void;
  readOnly?: boolean;
}

export default function GradingModal({ exam, student, competency, grade, onClose, onNavigate, readOnly }: GradingModalProps) {
  // Parse initial data
  const initialData = useMemo(() => grade ? JSON.parse(grade.data) : { 
    checkedIndicatorIds: [], 
    observations: {}, 
    timestamp: Date.now() 
  }, [grade]);

  const [checkedIds, setCheckedIds] = useState<string[]>(initialData.checkedIndicatorIds || []);
  const [observations, setObservations] = useState<Record<string, string>>(initialData.observations || {});
  const [status, setStatus] = useState<Grade["status"]>(grade?.status || "PENDING");
  const [isDirty, setIsDirty] = useState(false);

  // Sync state when grade changes
  useEffect(() => {
    setCheckedIds(initialData.checkedIndicatorIds || []);
    setObservations(initialData.observations || {});
    setStatus(grade?.status || "PENDING");
    setIsDirty(false);
  }, [grade, initialData]);

  const suggestedStatus = useMemo(() => 
    calculateSuggestedStatus(checkedIds, competency.indicators),
    [checkedIds, competency.indicators]
  );

  const toggleIndicator = (id: string) => {
    if (readOnly) return;
    setCheckedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    setIsDirty(true);
  };

  const updateObservation = (id: string, text: string) => {
    if (readOnly) return;
    setObservations(prev => ({ ...prev, [id]: text }));
    setIsDirty(true);
  };

  const handleSave = async (autoClose = true) => {
    if (readOnly) return;
    const pk = `${exam.id}+${student.id}+${competency.id}`;
    const finalStatus = status === "PENDING" ? suggestedStatus : status;

    const gradeData: Grade = {
      pk,
      examId: exam.id,
      studentId: student.id,
      competencyId: competency.id,
      status: finalStatus,
      data: JSON.stringify({
        checkedIndicatorIds: checkedIds,
        observations,
        timestamp: Date.now()
      })
    };

    try {
      await db.grades.put(gradeData);
      setIsDirty(false);
      if (autoClose) onClose();
    } catch (error) {
      console.error("Failed to save grade:", error);
    }
  };

  const handleNavigate = async (direction: "next" | "prev") => {
    if (isDirty && !readOnly) {
      await handleSave(false);
    }
    onNavigate?.(direction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-4">
             <div className="flex gap-1">
                <button 
                  onClick={() => handleNavigate("prev")}
                  className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => handleNavigate("next")}
                  className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
             </div>
             <div>
                <h2 className="font-bold text-slate-900 leading-tight">{student.lastName} {student.firstName}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{competency.label}</p>
             </div>
          </div>
          {readOnly && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100 text-[10px] font-bold uppercase">
              <Lock size={12} />
              Lecture seule
            </div>
          )}
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              Indicateurs Observables
              <div className="h-px flex-1 bg-slate-100"></div>
            </h3>
            
            {competency.indicators.map((ind: any) => (
              <div key={ind.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <button
                    disabled={readOnly}
                    onClick={() => toggleIndicator(ind.id)}
                    className={`shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                      checkedIds.includes(ind.id)
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100"
                        : "border-slate-200 text-transparent"
                    } ${readOnly ? "cursor-default" : "hover:border-slate-300"}`}
                  >
                    <Check size={24} strokeWidth={3} />
                  </button>
                  
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold leading-snug ${checkedIds.includes(ind.id) ? "text-slate-900" : "text-slate-600"}`}>
                        {ind.text}
                      </span>
                      {ind.critical && (
                        <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full border border-rose-100 uppercase tracking-tighter">
                          <Award size={10} />
                          Critique
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-start gap-2 group">
                      <MessageSquare size={14} className="mt-1 text-slate-300 group-focus-within:text-blue-400 transition-colors" />
                      <textarea
                        readOnly={readOnly}
                        value={observations[ind.id] || ""}
                        onChange={(e) => updateObservation(ind.id, e.target.value)}
                        placeholder={readOnly ? "Pas d'observation" : "Observation..."}
                        className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 resize-none placeholder:text-slate-300 text-slate-500 italic"
                        rows={1}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Décision finale</h3>
                {!readOnly && suggestedStatus !== "PENDING" && (
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md animate-pulse">
                    Suggestion: {suggestedStatus}
                  </span>
                )}
             </div>
             
             <div className="grid grid-cols-3 gap-3">
                <VerdictButton 
                  label="ACQUIS" 
                  isActive={status === "ACQUIS"} 
                  isSuggested={!readOnly && suggestedStatus === "ACQUIS" && status === "PENDING"}
                  onClick={() => { if (!readOnly) { setStatus("ACQUIS"); setIsDirty(true); } }}
                  colorClass="emerald"
                  icon={<Check size={20} />}
                  disabled={readOnly}
                />
                <VerdictButton 
                  label="NON ACQUIS" 
                  isActive={status === "NON_ACQUIS"} 
                  isSuggested={!readOnly && suggestedStatus === "NON_ACQUIS" && status === "PENDING"}
                  onClick={() => { if (!readOnly) { setStatus("NON_ACQUIS"); setIsDirty(true); } }}
                  colorClass="rose"
                  icon={<X size={20} />}
                  disabled={readOnly}
                />
                <VerdictButton 
                  label="REMÉDIATION" 
                  isActive={status === "REMEDIATION"} 
                  isSuggested={!readOnly && suggestedStatus === "REMEDIATION" && status === "PENDING"}
                  onClick={() => { if (!readOnly) { setStatus("REMEDIATION"); setIsDirty(true); } }}
                  colorClass="amber"
                  icon={<AlertCircle size={20} />}
                  disabled={readOnly}
                />
             </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all"
          >
            Fermer
          </button>
          {!readOnly && (
            <button
              onClick={() => handleSave(true)}
              className={`flex-[2] py-4 px-4 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isDirty ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" : "bg-slate-400 cursor-not-allowed"
              }`}
              disabled={!isDirty}
            >
              <Save size={20} />
              {isDirty ? "Enregistrer" : "Enregistré"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VerdictButton({ label, isActive, isSuggested, onClick, colorClass, icon, disabled }: any) {
  const colors = {
    emerald: isActive ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200" : "border-slate-100 text-slate-400 hover:border-emerald-200",
    rose: isActive ? "bg-rose-500 border-rose-500 text-white shadow-rose-200" : "border-slate-100 text-slate-400 hover:border-rose-200",
    amber: isActive ? "bg-amber-500 border-amber-500 text-white shadow-amber-200" : "border-slate-100 text-slate-400 hover:border-amber-200",
  } as any;

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`py-4 rounded-xl border-2 font-black transition-all flex flex-col items-center gap-1 relative ${colors[colorClass]} ${
        isSuggested ? "ring-4 ring-blue-400 ring-opacity-30 border-blue-200" : ""
      } ${disabled ? "cursor-default" : ""}`}
    >
      {icon}
      <span className="text-[10px] tracking-tighter">{label}</span>
    </button>
  );
}
