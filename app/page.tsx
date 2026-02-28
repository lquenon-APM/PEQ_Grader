"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import ExamCard from "@/components/exams/ExamCard";
import FloatingActionButton from "@/components/exams/FloatingActionButton";
import { Plus, ClipboardList } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const exams = useLiveQuery(() => db.exams.toArray());
  const students = useLiveQuery(() => db.students.toArray());

  const enrichedExams = exams?.map((exam) => {
    const examStudents = students?.filter((s) =>
      exam.studentIds.includes(s.id)
    ) || [];
    const groups = [...new Set(examStudents.map((s) => s.group))].sort();

    return {
      exam,
      studentCount: exam.studentIds.length,
      groups,
    };
  });

  const handleNewExam = () => {
    router.push("/exams/new");
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Exams</h1>
          <p className="text-slate-600 mt-1">
            Manage and grade your student assessments
          </p>
        </div>

        {/* Exam List */}
        {!exams || !students ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-slate-900">No exams yet</h3>
            <p className="text-slate-600 mb-4">
              Create your first exam to start grading students
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrichedExams?.map(({ exam, studentCount, groups }) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                studentCount={studentCount}
                groups={groups}
              />
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <FloatingActionButton
          onClick={handleNewExam}
          icon={<Plus size={24} />}
          label="New Exam"
        />
      </div>
    </div>
  );
}
