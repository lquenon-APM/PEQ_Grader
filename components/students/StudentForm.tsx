"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, type Student } from "@/lib/db";
import { Save, X } from "lucide-react";

interface StudentFormProps {
  initialStudent?: Student;
}

export default function StudentForm({ initialStudent }: StudentFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialStudent?.firstName || "");
  const [lastName, setLastName] = useState(initialStudent?.lastName || "");
  const [group, setGroup] = useState(initialStudent?.group || "");
  const [birthDate, setBirthDate] = useState(initialStudent?.birthDate || "");

  const isEditMode = Boolean(initialStudent);

  const handleSave = async () => {
    // Validation
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedGroup = group.trim();

    if (!trimmedFirstName) {
      alert("Le prénom est requis");
      return;
    }

    if (!trimmedLastName) {
      alert("Le nom est requis");
      return;
    }

    if (!trimmedGroup) {
      alert("Le groupe est requis");
      return;
    }

    try {
      if (initialStudent) {
        // Update existing student
        await db.students.update(initialStudent.id, {
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          group: trimmedGroup,
          birthDate: birthDate || undefined,
        });
      } else {
        // Create new student
        await db.students.add({
          id: crypto.randomUUID(),
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          group: trimmedGroup,
          birthDate: birthDate || undefined,
        });
      }

      router.push("/students");
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Erreur lors de la sauvegarde de l'élève.");
    }
  };

  const handleCancel = () => {
    router.push("/students");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">
          {isEditMode ? "Modifier l'élève" : "Ajouter un nouvel élève"}
        </h2>

        <div className="space-y-4">
          {/* First Name */}
          <div>
            <label htmlFor="student-firstname" className="block text-sm font-medium mb-2 text-slate-700">
              Prénom
            </label>
            <input
              id="student-firstname"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Entrez le prénom"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-white"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="student-lastname" className="block text-sm font-medium mb-2 text-slate-700">Nom</label>
            <input
              id="student-lastname"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Entrez le nom"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-white"
            />
          </div>

          {/* Birth Date */}
          <div>
            <label htmlFor="student-birthdate" className="block text-sm font-medium mb-2 text-slate-700">Date de naissance</label>
            <input
              id="student-birthdate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-white"
            />
          </div>

          {/* Group */}
          <div>
            <label htmlFor="student-group" className="block text-sm font-medium mb-2 text-slate-700">Groupe</label>
            <input
              id="student-group"
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder="Entrez le groupe (ex: 5TB, 6MA)"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Save size={20} />
            <span>{isEditMode ? "Mettre à jour" : "Enregistrer l'élève"}</span>
          </button>

          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-95 transition-all"
          >
            <X size={20} />
            <span>Annuler</span>
          </button>
        </div>
      </div>
    </div>
  );
}
