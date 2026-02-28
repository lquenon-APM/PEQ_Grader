"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { db, type Grid, type Student } from "@/lib/db";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  GraduationCap,
  Calendar,
  Users,
} from "lucide-react";

export default function ExamWizard() {
  const router = useRouter();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGridId, setSelectedGridId] = useState<string>("");
  const [selectedGridName, setSelectedGridName] = useState<string>("");
  const [examDate, setExamDate] = useState("");
  const [examLabel, setExamLabel] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [groupFilter, setGroupFilter] = useState<string>("all");

  // Data queries
  const grids = useLiveQuery(() => db.grids.toArray());
  const students = useLiveQuery(() => db.students.toArray());

  // Derived data
  const selectedGrid = grids?.find((g) => g.id === selectedGridId);
  const filteredStudents =
    groupFilter === "all"
      ? students
      : students?.filter((s) => s.group === groupFilter);
  const uniqueGroups = [...new Set(students?.map((s) => s.group) || [])].sort();
  const selectedStudents =
    students?.filter((s) => selectedStudentIds.includes(s.id)) || [];

  // Validation per step
  const canProceedStep1 = Boolean(selectedGridId);
  const canProceedStep2 = Boolean(examDate.trim() && examLabel.trim());
  const canProceedStep3 = selectedStudentIds.length > 0;

  const handleGridSelect = (grid: Grid) => {
    setSelectedGridId(grid.id);
    setSelectedGridName(grid.name);
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (filteredStudents) {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedStudentIds([]);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveExam = async () => {
    if (!selectedGrid) {
      alert("Error: Grid not found");
      return;
    }

    try {
      const exam = {
        id: crypto.randomUUID(),
        date: examDate,
        label: examLabel,
        gridName: selectedGridName,
        frozenGridStructure: structuredClone(selectedGrid.structure),
        studentIds: selectedStudentIds,
        status: "OPEN" as const,
      };

      await db.exams.add(exam);
      router.push("/");
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Failed to create exam. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">
              Étape {currentStep} sur 4
            </span>
            <span className="text-sm text-slate-500">
              {currentStep === 1 && "Sélection du protocole"}
              {currentStep === 2 && "Détails de l'examen"}
              {currentStep === 3 && "Sélection des élèves"}
              {currentStep === 4 && "Récapitulatif & Confirmation"}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Select Grid */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Sélectionner le protocole d&apos;évaluation</h2>
              <p className="text-slate-600 mb-6">
                Choisissez la grille de compétences à utiliser pour cet examen
              </p>

              {!grids ? (
                <p className="text-slate-400">Chargement des grilles...</p>
              ) : grids.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600">
                    Aucune grille disponible. Veuillez d&apos;abord créer une grille.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {grids.map((grid) => (
                    <div
                      key={grid.id}
                      onClick={() => handleGridSelect(grid)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedGridId === grid.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                      aria-label={`Sélectionner la grille ${grid.name}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{grid.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {grid.structure.competencies.length} compétences • Version{" "}
                            {grid.version}
                          </p>
                        </div>
                        {selectedGridId === grid.id && (
                          <CheckCircle className="text-blue-600" size={24} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Exam Metadata */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Détails de l&apos;examen</h2>
              <p className="text-slate-600 mb-6">
                Entrez la date et l&apos;intitulé de cet examen
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="exam-date" className="block text-sm font-medium mb-2">
                    Date de l&apos;examen
                  </label>
                  <input
                    id="exam-date"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="exam-label" className="block text-sm font-medium mb-2">
                    Intitulé de l&apos;examen
                  </label>
                  <input
                    id="exam-label"
                    type="text"
                    value={examLabel}
                    onChange={(e) => setExamLabel(e.target.value)}
                    placeholder="ex: Session de Juin 2026"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-white"
                  />
                </div>

                {selectedGridName && (
                  <div className="p-4 bg-blue-50 rounded-lg mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>Grille sélectionnée :</strong> {selectedGridName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Select Students */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Sélectionner les élèves</h2>
              <p className="text-slate-600 mb-6">
                Choisissez les élèves qui passeront cet examen
              </p>

              {!students ? (
                <p className="text-slate-400">Chargement des élèves...</p>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600">
                    Aucun élève disponible. Veuillez d&apos;abord ajouter des élèves.
                  </p>
                </div>
              ) : (
                <>
                  {/* Filter and Bulk Actions */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <label htmlFor="group-filter" className="text-sm font-medium">
                        Filtrer par groupe :
                      </label>
                      <select
                        id="group-filter"
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-white"
                      >
                        <option value="all">Tous les groupes</option>
                        {uniqueGroups.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectAll}
                        className="px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-95 transition-all"
                      >
                        Tout sélectionner
                      </button>
                      <button
                        onClick={handleDeselectAll}
                        className="px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-95 transition-all"
                      >
                        Tout désélectionner
                      </button>
                    </div>
                  </div>

                  {/* Student Count */}
                  <div className="mb-4 px-3 py-2 bg-blue-50 text-blue-800 text-sm rounded-lg">
                    {selectedStudentIds.length} élève{selectedStudentIds.length !== 1 ? "s" : ""} sélectionné{selectedStudentIds.length !== 1 ? "s" : ""}
                  </div>

                  {/* Student List */}
                  <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-lg">
                    {filteredStudents?.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => handleStudentToggle(student.id)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="font-medium">
                            {student.firstName} {student.lastName}
                          </span>
                          <span className="text-slate-500 text-sm ml-2">
                            ({student.group})
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Récapitulatif & Confirmation</h2>
              <p className="text-slate-600 mb-6">
                Vérifiez les détails de l&apos;examen avant la création
              </p>

              <div className="space-y-6">
                {/* Grid Info */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="text-blue-600" size={20} />
                    <h3 className="font-semibold">Protocole d&apos;évaluation</h3>
                  </div>
                  <p className="text-slate-700 ml-7">{selectedGridName}</p>
                  <p className="text-slate-600 text-sm ml-7">
                    {selectedGrid?.structure.competencies.length} compétences
                  </p>
                </div>

                {/* Exam Details */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-emerald-600" size={20} />
                    <h3 className="font-semibold">Détails de l&apos;examen</h3>
                  </div>
                  <p className="text-slate-700 ml-7">
                    <strong>Date :</strong>{" "}
                    {new Date(examDate).toLocaleDateString("fr-BE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-slate-700 ml-7">
                    <strong>Intitulé :</strong> {examLabel}
                  </p>
                </div>

                {/* Students */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="text-purple-600" size={20} />
                    <h3 className="font-semibold">Élèves</h3>
                  </div>
                  <p className="text-slate-700 ml-7 mb-2">
                    {selectedStudentIds.length} élève{selectedStudentIds.length !== 1 ? "s" : ""} sélectionné{selectedStudentIds.length !== 1 ? "s" : ""}
                  </p>
                  <div className="ml-7 max-h-[150px] overflow-y-auto">
                    {Object.entries(
                      selectedStudents.reduce((acc, student) => {
                        if (!acc[student.group]) {
                          acc[student.group] = [];
                        }
                        acc[student.group].push(student);
                        return acc;
                      }, {} as Record<string, Student[]>)
                    ).map(([group, groupStudents]) => (
                      <div key={group} className="mb-2">
                        <p className="text-sm font-semibold text-slate-600">
                          Groupe {group} :
                        </p>
                        <p className="text-sm text-slate-700">
                          {groupStudents
                            .map((s) => `${s.firstName} ${s.lastName}`)
                            .join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            <span>Retour</span>
          </button>

          <div className="flex-1" />

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedStep1) ||
                (currentStep === 2 && !canProceedStep2) ||
                (currentStep === 3 && !canProceedStep3)
              }
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Suivant</span>
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSaveExam}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <CheckCircle size={20} />
              <span>Créer l&apos;examen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
