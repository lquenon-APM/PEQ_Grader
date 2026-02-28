"use client";

import { type Exam } from "@/lib/db";
import { Calendar, GraduationCap, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ExamCardProps {
  exam: Exam;
  studentCount: number;
  groups: string[];
}

export default function ExamCard({ exam, studentCount, groups }: ExamCardProps) {
  const formattedDate = new Date(exam.date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link 
      href={`/exams/${exam.id}`}
      className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer block group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{exam.label}</h3>
          <p className="text-slate-600 text-sm mt-1 flex items-center gap-2">
            <Calendar size={16} />
            {formattedDate}
          </p>
        </div>
        <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-all" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <GraduationCap size={16} className="text-blue-600" />
          <span className="text-slate-700 font-medium">Grille : {exam.gridName}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users size={16} className="text-emerald-600" />
          <span className="text-slate-700">
            {studentCount} élève{studentCount !== 1 ? "s" : ""}
            {groups.length > 0 && (
              <span className="text-slate-500"> ({groups.join(", ")})</span>
            )}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded">
            {exam.frozenGridStructure.competencies.length} Critères
          </div>
        </div>
        <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          Lancer la cotation
        </span>
      </div>
    </Link>
  );
}
