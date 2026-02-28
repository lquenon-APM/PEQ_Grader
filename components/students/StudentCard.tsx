"use client";

import { type Student, db } from "@/lib/db";
import { Trash2, User, Calendar, Award } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";

interface StudentCardProps {
  student: Student;
  onDelete: (id: string) => void;
}

export default function StudentCard({ student, onDelete }: StudentCardProps) {
  const router = useRouter();
  
  // Fetch results summary for this student
  const grades = useLiveQuery(() => 
    db.grades.where("studentId").equals(student.id).toArray()
  );

  const examCount = [...new Set(grades?.map(g => g.examId))].length;
  const acquisCount = grades?.filter(g => g.status === "ACQUIS").length || 0;

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${student.firstName} ${student.lastName}?`
      )
    ) {
      onDelete(student.id);
    }
  };

  const handleViewDetails = () => {
    router.push(`/students/${student.id}`);
  };

  const formattedBirthDate = student.birthDate 
    ? new Date(student.birthDate).toLocaleDateString()
    : "Not specified";

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div 
          className="flex items-start gap-3 cursor-pointer group"
          onClick={handleViewDetails}
        >
          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            <User size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
              {student.firstName} {student.lastName}
            </h3>
            <div className="space-y-1 mt-1">
              <p className="text-slate-600 text-sm flex items-center gap-1">
                <span className="font-medium">Group:</span> {student.group}
              </p>
              <p className="text-slate-500 text-xs flex items-center gap-1">
                <Calendar size={14} />
                Born: {formattedBirthDate}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg active:scale-95 transition-all"
          title="Delete student"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Results Summary Section */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Award size={14} className="text-emerald-600" />
            <span>{examCount} Exam{examCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
            {acquisCount} Acquis
          </div>
        </div>
        
        <button 
          onClick={handleViewDetails}
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
