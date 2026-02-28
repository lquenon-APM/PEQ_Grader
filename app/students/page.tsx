"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import StudentCard from "@/components/students/StudentCard";
import CSVImporter from "@/components/students/CSVImporter";
import { Plus, Upload, Users } from "lucide-react";

export default function StudentsPage() {
  const router = useRouter();
  const students = useLiveQuery(() => db.students.toArray());
  const [showImporter, setShowImporter] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await db.students.delete(id);
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student. Please try again.");
    }
  };

  const handleAddStudent = () => {
    router.push("/students/new");
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Students</h1>
            <p className="text-slate-600 mt-1">
              Manage your student list and import from CSV
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowImporter(true)}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Upload size={20} />
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleAddStudent}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Plus size={20} />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Student List */}
        {!students ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <Users size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-slate-900">No students yet</h3>
            <p className="text-slate-600 mb-4">
              Add your first student or import from a CSV file
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(
              students.reduce((acc, student) => {
                const group = student.group || "No Group";
                if (!acc[group]) acc[group] = [];
                acc[group].push(student);
                return acc;
              }, {} as Record<string, typeof students>)
            )
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([group, groupStudents]) => (
                <div key={group}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                      Group {group}
                    </h2>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">
                      {groupStudents.length} Students
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupStudents.map((student) => (
                      <StudentCard
                        key={student.id}
                        student={student}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* CSV Importer Modal */}
        {showImporter && (
          <CSVImporter onClose={() => setShowImporter(false)} />
        )}
      </div>
    </div>
  );
}
