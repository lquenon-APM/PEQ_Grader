"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Student, type Grade, type Exam } from "@/lib/db";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Users, 
  Award, 
  ClipboardList,
  ChevronRight
} from "lucide-react";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const student = useLiveQuery(() => db.students.get(id));
  const grades = useLiveQuery(() => db.grades.where("studentId").equals(id).toArray());
  const exams = useLiveQuery(() => db.exams.toArray());

  if (!student) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Student not found or loading...</p>
        <button 
          onClick={() => router.push("/students")}
          className="mt-4 text-blue-600 hover:underline flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft size={16} /> Back to list
        </button>
      </div>
    );
  }

  // Enrich results with exam labels
  const results = grades?.map(grade => {
    const exam = exams?.find(e => e.id === grade.examId);
    return {
      ...grade,
      examLabel: exam?.label || "Unknown Exam",
      examDate: exam?.date || ""
    };
  }).sort((a, b) => b.examDate.localeCompare(a.examDate));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb / Back */}
      <button 
        onClick={() => router.push("/students")}
        className="mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
      >
        <div className="p-1 rounded-full group-hover:bg-blue-50">
          <ArrowLeft size={20} />
        </div>
        <span className="font-medium">Back to Students</span>
      </button>

      {/* Header Profile */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
            <User size={48} />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900">
              {student.firstName} {student.lastName}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600">
                <Users size={18} className="text-slate-400" />
                <span className="font-medium">Group:</span> {student.group}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600">
                <Calendar size={18} className="text-slate-400" />
                <span className="font-medium">Born:</span> {student.birthDate ? new Date(student.birthDate).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => router.push(`/students/new?id=${student.id}`)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <ClipboardList size={20} />
            </div>
            <span className="text-slate-500 font-medium">Exams</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {[...new Set(grades?.map(g => g.examId))].length}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Award size={20} />
            </div>
            <span className="text-slate-500 font-medium">Competencies Acquired</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {grades?.filter(g => g.status === "ACQUIS").length || 0}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Award size={20} />
            </div>
            <span className="text-slate-500 font-medium">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {grades?.filter(g => g.status === "PENDING").length || 0}
          </div>
        </div>
      </div>

      {/* Assessment History */}
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <ClipboardList size={20} />
        Assessment History
      </h2>

      {!results || results.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500">
          No assessments recorded yet for this student.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Exam</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((result) => (
                <tr key={result.pk} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {result.examLabel}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {result.examDate ? new Date(result.examDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      result.status === "ACQUIS" ? "bg-emerald-100 text-emerald-700" :
                      result.status === "NON_ACQUIS" ? "bg-rose-100 text-rose-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => router.push(`/exams/${result.examId}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
