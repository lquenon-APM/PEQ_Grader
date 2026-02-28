# Test Data Files

Ce dossier contient des fichiers de données de test pour l'application PEQ Grader.

## Fichiers CSV pour l'import d'étudiants

### `students-sample-5.csv`
Fichier avec 5 étudiants pour des tests rapides.
- Format: `firstName, lastName, group`
- Tous les enregistrements sont valides
- Groupes: A1, B2, C3

### `students-sample-20.csv`
Fichier avec 20 étudiants pour tester des volumes plus importants.
- Format: `firstName, lastName, group`
- Tous les enregistrements sont valides
- Groupes: A1, B2, C3, D4
- 5 étudiants par groupe pour faciliter les tests de filtrage

### `students-invalid-rows.csv`
Fichier avec des données invalides pour tester la validation CSV.
- 5 lignes au total
- 2 lignes valides (John Doe, David Wilson)
- 3 lignes invalides (champs manquants)
- Permet de tester la gestion des erreurs et l'affichage des lignes invalides

## Comment utiliser

1. **Import CSV manuel**:
   - Ouvrir l'application
   - Naviguer vers "Students"
   - Cliquer sur "Import CSV"
   - Sélectionner un des fichiers CSV ci-dessus

2. **Tests automatisés**:
   - Les fichiers peuvent être utilisés dans les tests avec FileReader API
   - Voir `components/students/__tests__/CSVImporter.test.tsx` pour des exemples

3. **Script de seed**:
   - Utiliser `lib/seedData.ts` pour peupler la base de données automatiquement
   - Exécuter le script depuis la console du navigateur ou via un bouton de debug

## Format CSV attendu

```
firstName, lastName, group
```

**Règles de validation:**
- Tous les champs sont obligatoires
- Les espaces blancs sont automatiquement supprimés
- Une ligne par étudiant
- Pas d'en-tête (header)

## Exemples de contenu valide

```csv
John, Doe, A1
Jane, Smith, B2
Bob, Johnson, C3
```

## Exemples de contenu invalide

```csv
, Doe, A1          // Prénom manquant
John, , B2          // Nom manquant
Jane, Smith,        // Groupe manquant
```
