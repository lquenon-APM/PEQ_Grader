# Epic: Import de Grilles CSV — Brownfield Enhancement

**Status:** DRAFT
**Date:** 2026-03-09
**Type:** Brownfield Enhancement (1-3 stories)
**PRD Reference:** FR1 - Grid Management (Hybrid) — Import

## Epic Goal

Permettre aux enseignants d'importer des grilles d'évaluation depuis un fichier CSV, en complément de la création manuelle existante, pour accélérer la mise en place des grilles et réduire les erreurs de saisie.

## Existing System Context

- **Fonctionnalité actuelle :** Création manuelle via `GridEditor.tsx` (critères + indicateurs + flag critique)
- **Stack :** Next.js 14+ / Tailwind CSS / Dexie.js (IndexedDB)
- **Patron existant :** `CSVImporter.tsx` pour les élèves — réutilisable pour les grilles
- **Points d'intégration :** Page `/grids` (listing), `db.grids` (persistance), interface `Grid` dans `lib/db.ts`

## Enhancement Details

- **Quoi :** Ajouter un bouton "Importer CSV" sur la page `/grids`, ouvrant un modal de parsing/preview/validation, puis persistance en tant qu'objet `Grid`
- **Intégration :** Suit le patron exact du `CSVImporter` existant ; réutilise la structure `Grid` de `lib/db.ts`
- **Format CSV proposé :**
  ```
  Competency;Indicator;Critical
  Préparation du poste;Vérifier l'arrivée de gaz;false
  Préparation du poste;Contrôler les connexions;true
  Soudure;Régler l'intensité;false
  Soudure;Pointer les pièces;false
  ```
  (Le regroupement par compétence se fait automatiquement par nom identique)

## Stories

### Story 1 : Parseur CSV → Grid

Créer un module `lib/grid-csv-parser.ts` qui transforme un CSV (séparateur `;` ou `,`) en objet `Grid`.

- Regrouper automatiquement les lignes par nom de compétence
- Valider les données (labels non vides, flag critique booléen)
- Retourner les erreurs ligne par ligne
- Tests unitaires du parseur

### Story 2 : Composant UI `GridCSVImporter`

Composant modal (patron `CSVImporter.tsx` existant).

- Upload fichier `.csv`, parsing, preview en tableau avec statut valid/invalid
- Saisie du titre de la grille avant import
- Bouton "Importer" → `db.grids.add()` → redirection vers `/grids`
- Gestion d'erreurs et feedback utilisateur

### Story 3 : Intégration dans la page Grilles

Intégrer le composant dans la page existante.

- Ajouter un bouton "Importer CSV" à côté de "Create New Grid" dans `app/grids/page.tsx`
- Toggle du modal `GridCSVImporter`
- S'assurer que les grilles importées apparaissent immédiatement dans la liste (via `useLiveQuery`)

## Compatibility Requirements

- [ ] Aucune modification de l'interface `Grid` existante dans `lib/db.ts`
- [ ] Aucune modification du schéma de la base de données
- [ ] UI conforme aux patterns Tailwind existants (touch targets 44x44px)
- [ ] La création manuelle via `GridEditor` reste inchangée

## Risk Mitigation

- **Risque principal :** CSV mal formé provoquant des grilles incomplètes
- **Mitigation :** Preview obligatoire avec validation avant import ; indicateurs visuels valid/invalid par ligne
- **Rollback :** Suppression simple de la grille importée depuis la page `/grids` (fonctionnalité existante)

## Definition of Done

- [ ] Un fichier CSV valide produit un objet `Grid` correct dans IndexedDB
- [ ] L'UI affiche un preview avec feedback de validation avant import
- [ ] Les grilles importées sont utilisables dans un examen (même comportement que les grilles manuelles)
- [ ] Le `GridEditor` et les fonctionnalités existantes ne sont pas impactés
- [ ] Aucune régression sur les fonctionnalités existantes

## Validation Checklist

| Check | Status |
|-------|--------|
| Epic complétable en 1-3 stories | 3 stories |
| Pas de changement architectural | Conforme — suit les patterns existants |
| Suit les patterns existants | Conforme — calqué sur `CSVImporter.tsx` |
| Complexité d'intégration gérable | Faible — ajout simple sans modification |
| Risque système faible | Faible — ajout additif, rien de destructif |

## Story Manager Handoff

Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to an existing system running Next.js 14+ / Tailwind CSS / Dexie.js
- Integration points: `lib/db.ts` (Grid interface), `app/grids/page.tsx` (listing), `components/grids/` (existing components)
- Existing patterns to follow: `components/students/CSVImporter.tsx` for the import modal pattern
- Critical compatibility requirements: No changes to `Grid` interface or DB schema; existing `GridEditor` must remain untouched
- Each story must include verification that existing functionality remains intact

The epic should maintain system integrity while delivering CSV grid import capability.
