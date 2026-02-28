# Guide de Test - PEQ Grader

Ce document explique comment tester l'application PEQ Grader, incluant les tests automatisés et les tests manuels avec des données de test.

## Tests Automatisés

### Exécuter tous les tests

```bash
npm test
```

### Exécuter les tests en mode watch

```bash
npm test -- --watch
```

### Exécuter les tests avec couverture

```bash
npm test -- --coverage
```

### Tests par composant

#### Tests du formulaire étudiant
```bash
npm test StudentForm
```

Tests inclus:
- ✅ Rendu du formulaire vide
- ✅ Mise à jour des champs
- ✅ Validation des champs obligatoires
- ✅ Suppression des espaces blancs
- ✅ Sauvegarde d'un nouvel étudiant
- ✅ Édition d'un étudiant existant
- ✅ Gestion des erreurs

#### Tests de l'importateur CSV
```bash
npm test CSVImporter
```

Tests inclus:
- ✅ Rendu du modal
- ✅ Parsing de fichiers CSV valides
- ✅ Détection des lignes invalides
- ✅ Affichage du statut de validation
- ✅ Import des étudiants valides uniquement
- ✅ Gestion des erreurs d'import
- ✅ Sélection de fichiers multiples

#### Tests du wizard d'examen
```bash
npm test ExamWizard
```

Tests inclus:
- ✅ Navigation entre les 4 étapes
- ✅ Validation par étape
- ✅ Sélection de grille (Étape 1)
- ✅ Saisie des métadonnées (Étape 2)
- ✅ Sélection d'étudiants avec filtrage (Étape 3)
- ✅ Révision et confirmation (Étape 4)
- ✅ **Freezing de la structure de grille (CRITIQUE)**
- ✅ Sauvegarde de l'examen
- ✅ Barre de progression
- ✅ Préservation des données lors de la navigation arrière

## Tests Manuels

### Option 1: Utiliser le script de seed (Recommandé)

Le moyen le plus rapide pour peupler la base de données avec des données de test.

#### Étapes:

1. **Démarrer l'application**
   ```bash
   npm run dev
   ```

2. **Ouvrir la console du navigateur**
   - Chrome/Edge: F12 ou Ctrl+Shift+I
   - Firefox: F12 ou Ctrl+Shift+K
   - Safari: Cmd+Option+I

3. **Importer le script de seed**

   D'abord, importez le module dans votre application. Ajoutez cette ligne dans `app/page.tsx` temporairement:

   ```typescript
   import "@/lib/seedData";
   ```

4. **Exécuter les commandes de seed**

   Dans la console du navigateur:

   ```javascript
   // Peupler toute la base de données (grilles + étudiants + examens)
   await seedDatabase.seedAll();

   // Ou peupler individuellement:
   await seedDatabase.seedGrids();      // Ajouter 3 grilles d'évaluation
   await seedDatabase.seedStudents();   // Ajouter 15 étudiants
   await seedDatabase.seedExams();      // Ajouter 3 examens

   // Afficher les statistiques
   await seedDatabase.stats();

   // Vider la base de données
   await seedDatabase.clearDatabase();
   ```

#### Données créées par seedAll():

**Grilles (3):**
- Grille Soudage - Niveau 1 (3 compétences, 8 indicateurs)
- Grille Électricité - Niveau 2 (2 compétences, 6 indicateurs)
- Grille Mécanique Auto - Diagnostic (2 compétences, 6 indicateurs)

**Étudiants (15):**
- Groupe A1: 5 étudiants
- Groupe B2: 5 étudiants
- Groupe C3: 5 étudiants

**Examens (3):**
- Examen Pratique Soudage (Groupe A1, 15 juin 2024)
- Évaluation Électricité (Groupe B2, 20 juin 2024)
- Examen Final Mécanique (Multi-groupes, 5 juillet 2024)

### Option 2: Import CSV manuel

Pour tester la fonctionnalité d'import CSV.

#### Fichiers disponibles:

1. **`public/test-data/students-sample-5.csv`**
   - 5 étudiants
   - Parfait pour des tests rapides
   - Tous les enregistrements valides

2. **`public/test-data/students-sample-20.csv`**
   - 20 étudiants (5 par groupe)
   - Pour tester des volumes plus importants
   - Tous les enregistrements valides

3. **`public/test-data/students-invalid-rows.csv`**
   - 5 lignes (2 valides, 3 invalides)
   - Pour tester la validation et la gestion d'erreurs

#### Étapes:

1. Démarrer l'application: `npm run dev`
2. Naviguer vers "Students"
3. Cliquer sur "Import CSV"
4. Sélectionner un fichier CSV depuis `public/test-data/`
5. Vérifier la prévisualisation
6. Cliquer sur "Import X Students"

## Scénarios de Test par User Story

### ✅ Story 2 - Critère 1: Import CSV de 20 étudiants

**Objectif:** Je peux uploader un CSV avec 20 étudiants et les voir dans la liste.

**Étapes:**
1. Naviguer vers `/students`
2. Cliquer sur "Import CSV"
3. Sélectionner `public/test-data/students-sample-20.csv`
4. Vérifier que la prévisualisation affiche "20 Valid"
5. Cliquer sur "Import 20 Students"
6. Vérifier l'alerte de succès
7. Vérifier que 20 cartes d'étudiants sont affichées
8. Vérifier la répartition: 5 par groupe (A1, B2, C3, D4)

**Résultat attendu:** ✅ 20 étudiants importés et visibles

---

### ✅ Story 2 - Critère 2: Création d'examen

**Objectif:** Je peux créer un nouvel examen en sélectionnant "Grid A" et "Student Group B".

**Prérequis:**
- Au moins une grille dans la base
- Au moins des étudiants du groupe B2

**Étapes:**
1. Utiliser `seedDatabase.seedAll()` pour créer des données
2. Naviguer vers le dashboard (`/`)
3. Cliquer sur le FAB "+ New Exam"
4. **Étape 1:** Sélectionner "Grille Soudage - Niveau 1"
5. Cliquer sur "Next"
6. **Étape 2:**
   - Date: Sélectionner une date (ex: 2024-12-15)
   - Label: "Test Exam Group B2"
7. Cliquer sur "Next"
8. **Étape 3:**
   - Filtrer par groupe: Sélectionner "B2"
   - Vérifier que seuls les étudiants du groupe B2 sont affichés
   - Cliquer sur "Select All"
   - Vérifier le compteur: "Selected: 5 students"
9. Cliquer sur "Next"
10. **Étape 4:**
    - Vérifier le résumé:
      - Grid: "Grille Soudage - Niveau 1"
      - Date et Label corrects
      - 5 étudiants du groupe B2
11. Cliquer sur "Create Exam"

**Résultat attendu:**
- ✅ Redirection vers le dashboard
- ✅ L'examen apparaît dans la liste
- ✅ Affiche le nom de la grille
- ✅ Affiche "5 students (B2)"

---

### ✅ Story 2 - Critère 3: Affichage dashboard

**Objectif:** Le Dashboard liste l'examen créé.

**Étapes:**
1. Après avoir créé un examen (voir critère 2)
2. Vérifier la présence de la carte d'examen
3. Vérifier les informations affichées:
   - Titre de l'examen
   - Date formatée
   - Nom de la grille
   - Nombre d'étudiants et groupes

**Résultat attendu:** ✅ L'examen est affiché avec toutes les infos

---

### ✅ Story 2 - Critère 4: Intégrité des données (CRITIQUE)

**Objectif:** Inspecter l'examen dans IndexedDB pour vérifier que `frozenGridStructure` est peuplé.

**Étapes:**

1. **Méthode 1: Via DevTools**
   - Ouvrir DevTools (F12)
   - Onglet "Application" (Chrome) ou "Storage" (Firefox)
   - IndexedDB → PEQGraderDB → exams
   - Cliquer sur un examen
   - Vérifier que `frozenGridStructure` contient:
     - `competencies` (array)
     - Chaque compétence a `id`, `label`, `indicators`
     - Pas de valeur null

2. **Méthode 2: Via Console**
   ```javascript
   // Récupérer tous les examens
   const exams = await db.exams.toArray();
   console.log(exams);

   // Vérifier le premier examen
   const exam = exams[0];
   console.log("Grid Name:", exam.gridName);
   console.log("Frozen Structure:", exam.frozenGridStructure);
   console.log("Competencies:", exam.frozenGridStructure.competencies.length);

   // Vérifier que c'est une copie profonde, pas une référence
   const originalGrid = await db.grids.toArray();
   console.log("Is same reference?", exam.frozenGridStructure === originalGrid[0]?.structure); // Devrait être FALSE
   ```

**Résultat attendu:**
- ✅ `frozenGridStructure` n'est pas null
- ✅ Contient toutes les compétences et indicateurs
- ✅ N'est pas une référence à la grille originale (copie profonde)

---

## Tests de Régression

### Après modification d'une grille

1. Créer une grille "Grid Test v1"
2. Créer un examen avec cette grille
3. Modifier la grille (ajouter/supprimer des compétences)
4. Vérifier que l'examen existant conserve l'ancienne structure
5. Créer un nouvel examen avec la grille modifiée
6. Vérifier que le nouvel examen a la nouvelle structure

**Résultat attendu:** Les examens existants ne sont pas affectés par les modifications de grille

---

## Tests de Performance

### Import CSV de 100+ étudiants

1. Créer un fichier CSV avec 100+ étudiants
2. Importer via l'interface
3. Vérifier que:
   - Le parsing est instantané
   - La prévisualisation s'affiche rapidement
   - L'import prend moins de 2 secondes
   - La liste des étudiants se charge rapidement

---

## Tests de Validation

### Validation du formulaire étudiant

- [ ] Prénom vide → Message d'erreur
- [ ] Nom vide → Message d'erreur
- [ ] Groupe vide → Message d'erreur
- [ ] Espaces blancs supprimés automatiquement
- [ ] Sauvegarde réussie avec données valides

### Validation du wizard d'examen

- [ ] Étape 1: Bouton Next désactivé sans sélection de grille
- [ ] Étape 2: Bouton Next désactivé avec champs vides
- [ ] Étape 3: Bouton Next désactivé sans étudiants sélectionnés
- [ ] Bouton Back désactivé à l'étape 1

### Validation CSV

- [ ] Ligne sans prénom → Marquée invalide
- [ ] Ligne sans nom → Marquée invalide
- [ ] Ligne sans groupe → Marquée invalide
- [ ] Lignes valides importées, invalides ignorées
- [ ] Compteur exact: "X Valid, Y Invalid"

---

## Debugging

### Voir l'état de la base de données

```javascript
// Dans la console du navigateur
await seedDatabase.stats();
```

### Vider complètement la base de données

```javascript
await seedDatabase.clearDatabase();
```

### Réinitialiser avec données fraîches

```javascript
await seedDatabase.clearDatabase();
await seedDatabase.seedAll();
```

---

## Checklist Complète User Story 2

- [ ] **Tests automatisés passent tous**
  - [ ] StudentForm.test.tsx (13 tests)
  - [ ] CSVImporter.test.tsx (12 tests)
  - [ ] ExamWizard.test.tsx (20+ tests)

- [ ] **Critères d'acceptation**
  - [ ] Import CSV 20 étudiants ✅
  - [ ] Création examen Grid A + Group B ✅
  - [ ] Dashboard liste l'examen ✅
  - [ ] frozenGridStructure peuplé dans IndexedDB ✅
  - [ ] Nom de grille affiché sur le dashboard ✅

- [ ] **Tests de navigation**
  - [ ] Lien "Students" dans la sidebar
  - [ ] Navigation vers /students/new
  - [ ] Navigation vers /exams/new
  - [ ] FAB "+ New Exam" fonctionne
  - [ ] Retour au dashboard après création

- [ ] **Tests d'intégration**
  - [ ] Workflow complet: Import CSV → Création examen → Affichage dashboard
  - [ ] Modifications de grille n'affectent pas les examens existants
  - [ ] Suppression d'étudiant (confirmation)
  - [ ] Édition d'étudiant

---

## Support

Pour toute question sur les tests, consulter:
- Code des tests: `components/**/__tests__/`
- Données de test: `public/test-data/`
- Script de seed: `lib/seedData.ts`
- Architecture: `docs/architecture.md`
