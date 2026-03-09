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
- [x] Logique mise à jour dans `lib/logic.ts`
- [x] Tests unitaires passés dans `lib/__tests__/logic.test.ts`
- [x] Interface visuelle validée (couleur orange pour la remédiation)
- [x] Documentation technique mise à jour

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### File List
| File | Status | Description |
|------|--------|-------------|
| `lib/logic.ts` | EXISTS | calculateSuggestedStatus with SUCCESS_THRESHOLD = 0.75 |
| `lib/__tests__/logic.test.ts` | EXISTS | 7 tests covering all threshold scenarios |
| `components/exams/GradingModal.tsx` | EXISTS | REMEDIATION suggestion display + button |
| `components/exams/MatrixView.tsx` | EXISTS | Amber styling for REMEDIATION status |

### Completion Notes
- All code was already implemented from prior development (Story 3 depended on this logic)
- 3 rules implemented: NON_ACQUIS (critical missing), REMEDIATION (< 75% standards), ACQUIS (>= 75%)
- SUCCESS_THRESHOLD exported as named constant for easy modification
- GradingModal shows REMEDIATION as suggested status in real-time
- MatrixView uses amber color scheme (bg-amber-100 text-amber-700) for REMEDIATION
- 7 unit tests covering: empty, critical missing, 50%, 75%, 100%, only-criticals, only-standards
- Story retroactively marked Done

### Debug Log References
None.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-09 | 1.0 | Retroactive completion — all ACs verified as implemented | Dev Agent (James) |
