# Story 7: Exportation Groupée (Batch ZIP) - Simplification du flux de fin d'examen

## User Story
En tant qu'**Enseignant**,
Je veux **pouvoir exporter tous les rapports PDF d'un examen en un seul fichier compressé (ZIP)**,
Afin de **gagner du temps lors de la remontée des résultats vers le secrétariat ou le stockage central.**

## Story Context

**Existing System Integration:**
- Integrates with: `@react-pdf/renderer` (Génération des PDF), `lib/db.ts` (Données de l'examen).
- New Dependency: `jszip` (Pour la compression côté client).
- UI Touch points: `components/exams/MatrixView.tsx` (Ajout du bouton d'export global).

## Acceptance Criteria

**Functional Requirements:**
1. Ajouter un bouton "Tout exporter (ZIP)" sur la vue Matrix d'un examen.
2. Générer automatiquement le PDF pour chaque étudiant inscrit à l'examen.
3. Compresser tous les PDF générés dans un seul fichier `.zip`.
4. Nommer le ZIP selon le format : `PEQ_Rapports_[Label_Examen]_[Date].zip`.
5. Nommer chaque PDF à l'intérieur du ZIP : `[Nom]_[Prénom]_Rapport.pdf`.

**Integration Requirements:**
6. Utiliser la logique de génération existante de `PDFReport.tsx`.
7. Afficher un indicateur de progression pendant la génération (car générer 20 PDF peut prendre quelques secondes sur tablette).

**Quality Requirements:**
8. Vérifier que le ZIP est valide et lisible sur Windows/macOS/Linux.
9. Gérer les cas où certains étudiants n'ont pas encore de notes (générer un rapport "Incomplet" ou avertir l'utilisateur).

## Technical Notes

- **Library:** `jszip` est la référence pour créer des ZIP en JS côté client.
- **Workflow PDF:** Utiliser `pdf(document).toBlob()` de `@react-pdf/renderer` pour obtenir les fichiers sans interaction utilisateur.
- **Performance:** Boucler sur les étudiants et attendre la promesse de chaque PDF avant de l'ajouter au ZIP.

## Definition of Done
- [ ] Bibliothèque `jszip` installée.
- [ ] Fonction utilitaire d'export groupé créée.
- [ ] Bouton ajouté à l'interface `MatrixView`.
- [ ] Test d'export réussi avec un examen de 5+ étudiants.
- [ ] Documentation mise à jour.
