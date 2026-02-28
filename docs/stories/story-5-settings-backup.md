# Story 5: Paramètres et Sauvegarde Locale - Ajout Brownfield

## User Story
En tant qu'**Enseignant**,
Je veux **pouvoir exporter et importer ma base de données ainsi que la réinitialiser**,
Afin de **sécuriser mes données d'examen hors du navigateur et préparer de nouvelles sessions proprement.**

## Story Context

**Existing System Integration:**
- Integrates with: `lib/db.ts` (Dexie.js / IndexedDB)
- Technology: Next.js 15, Tailwind CSS, Lucide React, Dexie
- Follows pattern: Standard Page layout with Sidebar and Header (see `app/layout.tsx`)
- Touch points: `/settings` route, `db` singleton from `@/lib/db`

## Acceptance Criteria

**Functional Requirements:**
1. Create a responsive Settings page at `/settings`.
2. Implement a "Export Data" button that generates a JSON file containing all IndexedDB tables.
3. Implement a "Reset Database" button with a double-confirmation modal to prevent accidental data loss.
4. Display basic app information (Version 0.1.0, DB Status).

**Integration Requirements:**
5. The Settings link in the sidebar must correctly navigate to the new page.
6. Database operations must use the existing `db` instance from `lib/db.ts`.
7. UI must follow the existing dark/light theme (Slate 900/50) and spacing patterns.

**Quality Requirements:**
8. Exported JSON must be valid and contain `grids`, `students`, `exams`, and `grades` tables.
9. Reset operation must successfully clear all tables and redirect to the dashboard.
10. Mobile-friendly UI (optimized for tablets as per PRD).

## Technical Notes

- **Integration Approach:** Use `db.export()` or a manual `Promise.all` on `db.tables` if `dexie-export-import` is not added. For MVP, a manual JSON stringify of all records is sufficient and lightweight.
- **Existing Pattern Reference:** Follow the style of `app/students/page.tsx` for list/actions layout.
- **Key Constraints:** 
    - No external backend; everything is client-side.
    - Exported file name pattern: `PEQ_Backup_YYYY-MM-DD_HHmm.json`.

## Definition of Done
- [x] Functional requirements met (Export & Reset)
- [x] Integration requirements verified (Sidebar link works)
- [x] UI follows existing design patterns
- [x] Tests for export logic (if possible in JSDOM)
- [x] Documentation updated (GEMINI.md)

## Risk and Compatibility Check

**Minimal Risk Assessment:**
- **Primary Risk:** Accidental database wipe.
- **Mitigation:** Red confirmation button + native `window.confirm` or a custom Modal.
- **Rollback:** Database changes are destructive (Delete), but Export provides a manual fallback.

**Compatibility Verification:**
- [x] No breaking changes to existing APIs
- [x] Database changes are additive/management-only
- [x] UI changes follow existing design patterns
- [x] Performance impact is negligible
