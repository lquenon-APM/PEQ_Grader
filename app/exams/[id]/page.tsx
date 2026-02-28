"use client";

import { use, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ArrowLeft, Users, ClipboardCheck, Info } from "lucide-react";
import Link from "next/link";
import MatrixView from "@/components/exams/MatrixView";

interface ExamPageProps {
  params: Promise<{ id: string }>;
}

export default function ExamPage({ params }: ExamPageProps) {
  const { id: examId } = use(params);
  
  // Data Fetching
  const exam = useLiveQuery(() => db.exams.get(examId), [examId]);
  const students = useLiveQuery(() => db.students.toArray());
  const grades = useLiveQuery(
    () => db.grades.where("examId").equals(examId).toArray(),
    [examId]
  );

  if (!exam || !students || !grades) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement de l&apos;examen...</p>
        </div>
      </div>
    );
  }

  // Filter students enrolled in this exam
  const examStudents = students.filter((s) => exam.studentIds.includes(s.id));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{exam.label}</h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <ClipboardCheck size={14} />
                  {exam.gridName}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {examStudents.length} élèves
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">État global</span>
              <span className="text-xs font-semibold text-emerald-600">En cours de cotation</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: The Matrix */}
      <main className="max-w-[1600px] mx-auto p-4 md:p-6">
        <MatrixView 
          exam={exam} 
          students={examStudents} 
          grades={grades} 
        />
      </main>
      
      {/* Help / Info Bar */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <Info size={24} />
        </button>
      </div>
    </div>
  );
}
