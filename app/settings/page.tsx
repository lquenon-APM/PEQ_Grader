"use client";

import { useState } from "react";
import { 
  Save, 
  Upload, 
  Trash2, 
  Database, 
  Info, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";
import { 
  exportFullDatabase, 
  downloadBackup, 
  resetDatabase, 
  importDatabase 
} from "@/lib/db-utils";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportFullDatabase();
      downloadBackup(blob);
      setMessage({ type: "success", text: "Sauvegarde exportée avec succès !" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Erreur lors de l'exportation." });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Attention : l'importation remplacera TOUTES les données actuelles. Continuer ?")) {
      e.target.value = "";
      return;
    }

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          await importDatabase(content);
          setMessage({ type: "success", text: "Données restaurées avec succès !" });
          setTimeout(() => router.refresh(), 1000);
        } catch (err) {
          setMessage({ type: "error", text: "Fichier invalide ou corrompu." });
        } finally {
          setIsImporting(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      setIsImporting(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("ACTION CRITIQUE : Voulez-vous vraiment effacer TOUTES les données (étudiants, grilles, examens) ? Cette action est irréversible.")) {
      return;
    }

    setIsResetting(true);
    try {
      await resetDatabase();
      setMessage({ type: "success", text: "Base de données réinitialisée." });
      setTimeout(() => router.push("/"), 1500);
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la réinitialisation." });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">
            Gérez vos données locales et la configuration de l&apos;application.
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup & Restore Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <Database size={24} />
              <h2 className="text-xl font-bold text-slate-900">Sauvegarde</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Exportez vos données dans un fichier JSON pour les sécuriser ou les transférer sur un autre appareil.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
              >
                <Save size={20} />
                <span>{isExporting ? "Exportation..." : "Exporter les données (JSON)"}</span>
              </button>

              <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-95 transition-all cursor-pointer border border-slate-300 border-dashed">
                <Upload size={20} />
                <span>{isImporting ? "Importation..." : "Importer un backup"}</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                  disabled={isImporting}
                />
              </label>
            </div>
          </div>

          {/* Database Management Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <Trash2 size={24} />
              <h2 className="text-xl font-bold text-slate-900">Maintenance</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Supprimez toutes les données stockées localement. Utile pour préparer une nouvelle session vierge.
            </p>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50"
            >
              <Trash2 size={20} />
              <span>{isResetting ? "Réinitialisation..." : "Vider la base de données"}</span>
            </button>
          </div>

          {/* App Info Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
            <div className="flex items-center gap-3 mb-4 text-slate-600">
              <Info size={24} />
              <h2 className="text-xl font-bold text-slate-900">Informations</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="block text-slate-400">Version</span>
                <span className="font-mono font-bold text-slate-700">0.1.0-beta</span>
              </div>
              <div>
                <span className="block text-slate-400">Stockage</span>
                <span className="font-bold text-slate-700">IndexedDB (Local)</span>
              </div>
              <div>
                <span className="block text-slate-400">Date de session</span>
                <span className="font-bold text-slate-700">{new Date().toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block text-slate-400">Environnement</span>
                <span className="font-bold text-slate-700">Production Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
