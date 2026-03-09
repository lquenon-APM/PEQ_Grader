"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Plus, Grid3x3, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import GridCSVImporter from "@/components/grids/GridCSVImporter";

export default function GridsPage() {
  const grids = useLiveQuery(() => db.grids.toArray());
  const [showImporter, setShowImporter] = useState(false);

  const deleteGrid = async (gridId: string) => {
    if (confirm("Are you sure you want to delete this grid?")) {
      try {
        await db.grids.delete(gridId);
      } catch (error) {
        console.error("Failed to delete grid:", error);
        alert("Failed to delete grid");
      }
    }
  };

  if (!grids) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Grading Grids</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImporter(true)}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-95 transition-all h-12"
            >
              <Upload size={20} />
              Importer CSV
            </button>
            <Link
              href="/grids/new"
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all h-12"
            >
              <Plus size={20} />
              Create New Grid
            </Link>
          </div>
        </div>

        {grids.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <Grid3x3 size={64} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              No grids yet
            </h2>
            <p className="text-slate-500 mb-6">
              Create your first grading grid to get started
            </p>
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/grids/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Plus size={20} />
                Create Grid
              </Link>
              <button
                onClick={() => setShowImporter(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 active:scale-95 transition-all"
              >
                <Upload size={20} />
                ou Importer depuis CSV
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grids.map((grid) => (
              <div
                key={grid.id}
                className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900 mb-1">
                      {grid.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Version {grid.version}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteGrid(grid.id)}
                    className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg active:scale-95 transition-all"
                    aria-label="Delete grid"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-1 text-sm text-slate-600">
                  <div>
                    <span className="font-medium">
                      {grid.structure.competencies.length}
                    </span>{" "}
                    Competenc{grid.structure.competencies.length === 1 ? "y" : "ies"}
                  </div>
                  <div>
                    <span className="font-medium">
                      {grid.structure.competencies.reduce(
                        (sum, c) => sum + c.indicators.length,
                        0
                      )}
                    </span>{" "}
                    Indicator{
                      grid.structure.competencies.reduce(
                        (sum, c) => sum + c.indicators.length,
                        0
                      ) === 1
                        ? ""
                        : "s"
                    }
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-400 italic">
                    Utilisez cette grille dans un nouvel examen pour commencer la cotation.
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {showImporter && (
          <GridCSVImporter onClose={() => setShowImporter(false)} />
        )}
      </div>
    </div>
  );
}
