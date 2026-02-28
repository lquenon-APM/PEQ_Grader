# Story 6: Logique de Remédiation - Affinement de l'Assistant

## User Story
En tant qu'**Enseignant**,
Je veux que l'assistant de notation me suggère explicitement une **"Remédiation"** lorsque trop d'indicateurs standards sont manquants,
Afin de **prendre une décision pédagogique juste, même si les points critiques sont validés.**

## Story Context

**Existing System Integration:**
- Integrates with: `lib/logic.ts` (Moteur de calcul)
- UI Touch points: `components/exams/GradingModal.tsx` (Affichage de la suggestion)
- Technology: TypeScript, Jest for testing.

## Acceptance Criteria

**Functional Requirements:**
1. Modifier le moteur de calcul pour intégrer un seuil de réussite (X%).
2. **Règle 1 (Échec) :** Si UN SEUL indicateur critique est manquant -> `NON_ACQUIS` (Priorité absolue).
3. **Règle 2 (Remédiation) :** Si TOUS les indicateurs critiques sont validés MAIS que moins de 75% des indicateurs standards sont cochés -> `REMEDIATION`.
4. **Règle 3 (Acquis) :** Si TOUS les indicateurs critiques sont validés ET que 75% ou plus des indicateurs standards sont cochés -> `ACQUIS`.
5. Si 100% des indicateurs sont cochés -> `ACQUIS`.

**Integration Requirements:**
6. La suggestion doit être mise à jour en temps réel dans le modal d'évaluation.
7. Le PDF de rapport doit refléter correctement le statut "REMEDIATION".

**Quality Requirements:**
8. Couverture de tests unitaires exhaustive pour les différents seuils (0%, 50%, 75%, 100%).
9. Le seuil de 75% doit être facilement modifiable dans le code (constante).

## Technical Notes

- **Logic Update:** La fonction `calculateSuggestedStatus` dans `lib/logic.ts` doit être enrichie.
- **Seuil par défaut :** 75% (Standard PEQ fréquent, à confirmer par l'utilisateur si besoin).

## Definition of Done
- [ ] Logique mise à jour dans `lib/logic.ts`
- [ ] Tests unitaires passés dans `lib/__tests__/logic.test.ts`
- [ ] Interface visuelle validée (couleur orange pour la remédiation)
- [ ] Documentation technique mise à jour
