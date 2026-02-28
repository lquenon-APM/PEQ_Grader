"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Award } from "lucide-react";
import { db, type Grid } from "@/lib/db";
import { useRouter } from "next/navigation";

interface Indicator {
  id: string;
  text: string;
  critical: boolean;
  description?: string;
}

interface Competency {
  id: string;
  label: string;
  indicators: Indicator[];
}

interface GridEditorProps {
  initialGrid?: Grid;
}

// Helper to generate IDs safely
const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export default function GridEditor({ initialGrid }: GridEditorProps) {
  const router = useRouter();
  const [gridTitle, setGridTitle] = useState(initialGrid?.name || "");
  const [errors, setErrors] = useState<string[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>(
    initialGrid?.structure.competencies || [
      {
        id: generateId(),
        label: "",
        indicators: [{ id: generateId(), text: "", critical: false, description: "" }],
      },
    ]
  );

  const addCompetency = () => {
    setCompetencies([
      ...competencies,
      {
        id: generateId(),
        label: "",
        indicators: [{ id: generateId(), text: "", critical: false, description: "" }],
      },
    ]);
  };

  const removeCompetency = (compId: string) => {
    if (competencies.length > 1) {
      setCompetencies(competencies.filter((c) => c.id !== compId));
    }
  };

  const updateCompetencyLabel = (compId: string, label: string) => {
    setCompetencies(
      competencies.map((c) => (c.id === compId ? { ...c, label } : c))
    );
  };

  const addIndicator = (compId: string) => {
    setCompetencies(
      competencies.map((c) =>
        c.id === compId
          ? {
              ...c,
              indicators: [
                ...c.indicators,
                { id: generateId(), text: "", critical: false, description: "" },
              ],
            }
          : c
      )
    );
  };

  const removeIndicator = (compId: string, indId: string) => {
    setCompetencies(
      competencies.map((c) =>
        c.id === compId
          ? {
              ...c,
              indicators:
                c.indicators.length > 1
                  ? c.indicators.filter((i) => i.id !== indId)
                  : c.indicators,
            }
          : c
      )
    );
  };

  const updateIndicatorText = (compId: string, indId: string, text: string) => {
    setCompetencies(
      competencies.map((c) =>
        c.id === compId
          ? {
              ...c,
              indicators: c.indicators.map((i) =>
                i.id === indId ? { ...i, text } : i
              ),
            }
          : c
      )
    );
  };

  const updateIndicatorDescription = (compId: string, indId: string, description: string) => {
    setCompetencies(
      competencies.map((c) =>
        c.id === compId
          ? {
              ...c,
              indicators: c.indicators.map((i) =>
                i.id === indId ? { ...i, description } : i
              ),
            }
          : c
      )
    );
  };

  const toggleIndicatorCritical = (compId: string, indId: string) => {
    setCompetencies(
      competencies.map((c) =>
        c.id === compId
          ? {
              ...c,
              indicators: c.indicators.map((i) =>
                i.id === indId ? { ...i, critical: !i.critical } : i
              ),
            }
          : c
      )
    );
  };

  const saveGrid = async () => {
    const newErrors: string[] = [];
    if (!gridTitle.trim()) newErrors.push("Le titre de la grille est requis");
    if (competencies.length === 0) newErrors.push("Ajoutez au moins un critère");
    
    const hasEmptyCompetency = competencies.some((c) => !c.label.trim());
    if (hasEmptyCompetency) newErrors.push("Tous les critères doivent avoir un libellé");

    const hasEmptyIndicator = competencies.some((c) =>
      c.indicators.some((i) => !i.text.trim())
    );
    if (hasEmptyIndicator) newErrors.push("Tous les indicateurs doivent avoir un texte");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const gridData: Omit<Grid, "id"> = {
        name: gridTitle,
        structure: { competencies },
        version: initialGrid?.version ? initialGrid.version + 1 : 1,
      };

      if (initialGrid) {
        await db.grids.update(initialGrid.id, gridData);
      } else {
        await db.grids.add({
          id: generateId(),
          ...gridData,
        });
      }

      router.push("/grids");
    } catch (error) {
      console.error("Failed to save grid:", error);
      alert("Erreur lors de la sauvegarde. Vérifiez votre console.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">
          {initialGrid ? "Modifier la grille" : "Créer une nouvelle grille"}
        </h1>
        <p className="text-slate-600">Définissez vos critères et indicateurs observables pour l&apos;évaluation.</p>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
          <p className="font-bold mb-1 italic text-sm">Veuillez corriger les erreurs suivantes :</p>
          <ul className="list-disc list-inside text-sm">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
        <label htmlFor="grid-title" className="block mb-2 font-bold text-slate-700">Titre de la Grille</label>
        <input
          id="grid-title"
          type="text"
          value={gridTitle}
          onChange={(e) => setGridTitle(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-white text-lg font-medium"
          placeholder="ex: Soudure CQ6 - Juin 2026"
        />
      </div>

      <div className="space-y-6">
        {competencies.map((comp, compIndex) => (
          <div key={comp.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-3">
              <div className="w-12 h-10 bg-slate-800 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                CRIT {compIndex + 1}
              </div>
              <input
                aria-label={`Libellé du critère ${compIndex + 1}`}
                type="text"
                value={comp.label}
                onChange={(e) => updateCompetencyLabel(comp.id, e.target.value)}
                className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-white font-semibold"
                placeholder="Libellé du critère (ex: Préparation du poste)"
              />
              <button
                onClick={() => removeCompetency(comp.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                title="Supprimer le critère"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Indicateurs observables</p>
              {comp.indicators.map((ind, indIndex) => (
                <div key={ind.id} className="space-y-2 p-3 bg-slate-50/50 rounded-lg border border-slate-100 group">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-8">
                      IND {indIndex + 1}
                    </span>
                    <input
                      aria-label={`Indicateur ${indIndex + 1} du critère ${compIndex + 1}`}
                      type="text"
                      value={ind.text}
                      onChange={(e) =>
                        updateIndicatorText(comp.id, ind.id, e.target.value)
                      }
                      className="flex-1 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-white"
                      placeholder="Description de l'indicateur observable"
                    />
                    
                    <button
                      onClick={() => toggleIndicatorCritical(comp.id, ind.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                        ind.critical 
                        ? "bg-rose-50 border-rose-200 text-rose-600 font-bold" 
                        : "bg-white border-slate-200 text-slate-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                      }`}
                      title={ind.critical ? "Indicateur critique" : "Marquer comme critique"}
                    >
                      <Award size={16} />
                      <span className="text-[10px]">CRITIQUE</span>
                    </button>

                    <button
                      onClick={() => removeIndicator(comp.id, ind.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Supprimer l'indicateur"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="pl-11 flex gap-2 items-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Observation type :</div>
                    <input 
                      type="text"
                      value={ind.description || ""}
                      onChange={(e) => updateIndicatorDescription(comp.id, ind.id, e.target.value)}
                      className="flex-1 bg-transparent text-xs text-slate-500 border-b border-dashed border-slate-200 focus:border-blue-400 focus:outline-none py-1"
                      placeholder="Ex: Notez ici les points d'attention spécifiques..."
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => addIndicator(comp.id)}
                className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg active:scale-95 transition-all font-medium text-sm mt-2"
              >
                <Plus size={18} />
                <span>Ajouter un indicateur</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
        <button
          onClick={addCompetency}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 active:scale-95 transition-all shadow-md font-bold"
        >
          <Plus size={20} />
          Nouveau Critère
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => router.push("/grids")}
            className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all font-bold"
          >
            Annuler
          </button>
          <button
            onClick={saveGrid}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-200 font-bold"
          >
            <Save size={20} />
            Enregistrer la Grille
          </button>
        </div>
      </div>
    </div>
  );
}
