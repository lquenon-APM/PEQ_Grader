---
id: STORY-1
title: Core Setup & Grid Management
status: Done
priority: High
epic: EPIC-1
---

# User Story: Core Setup & Grid Management

**As a** System Administrator / Teacher
**I want to** have the application foundation ready and be able to create Grading Grids
**So that** I can prepare for the upcoming exams.

## Context
This is the foundational story. We are building a **Local-First** web app using Next.js and Dexie.js (IndexedDB).
The first feature is the "Grid Manager" which allows creating the Templates (Competencies + Indicators) that will be used for grading.

## References
*   [Architecture Document](../architecture.md) (See Section 3.2 for Schema)
*   [Front-End Spec](../architecture/front-end-spec.md) (See Section 1 for Design System)
*   [AI UI Prompt](../prompts/ui-generation-prompt.md) (Use this to scaffold the App Shell)

## Tasks
- [x] **Initialize Project** <!-- id: 1 -->
    - Run `npx create-next-app@latest . --typescript --tailwind --eslint`.
    - Install dependencies: `dexie`, `dexie-react-hooks`, `zustand`, `lucide-react`, `clsx`.
    - Configure `eslint` and `prettier`.
    - Clean up default Next.js boilerplate (page.tsx, globals.css).

- [x] **Setup Database (Dexie)** <!-- id: 2 -->
    - Create `lib/db.ts`.
    - Implement `PEQGraderDatabase` class extending `Dexie`.
    - Define stores: `grids`, `students`, `exams`, `grades` matching `architecture.md` schema.
    - Export a singleton `db` instance.

- [x] **Setup State Management** <!-- id: 3 -->
    - Create `stores/useGlobalStore.ts` (Zustand).
    - Add basic UI state (e.g., `sidebarOpen`).

- [x] **Implement App Shell** <!-- id: 4 -->
    - Create `app/layout.tsx` with the Sticky Header and Sidebar as defined in `front-end-spec.md`.
    - Use the defaults from `ui-generation-prompt.md` for styling.

- [x] **Implement Grid Editor (CRUD)** <!-- id: 5 -->
    - Create `components/grids/GridEditor.tsx`:
        - Input for Grid Title.
        - Dynamic list for Competencies.
        - Nested dynamic list for Indicators (with "Critical" toggle).
    - Create `app/grids/page.tsx`:
        - List existing grids (fetch from Dexie).
        - Button to "Create New" -> leads to Editor.
    - Save logic: Persist valid Grid object to `db.grids`.

## Acceptance Criteria
- [x] Project builds without errors (`npm run build`).
- [x] Database is created in Browser (can verify via DevTools > Application > IndexedDB).
- [x] User can create a Grid with 1 Competency and 2 Indicators.
- [x] Created Grid persists after page reload.
- [x] UI follows the "Dark Slate" theme defined in the Spec.

## Dev Agent Record
### Debug Log
- **Issue**: `dexie-react-hooks` version 2.0.1 not found on npm
  **Resolution**: Downgraded to version 1.1.7 (latest available)
- **Issue**: Missing `autoprefixer` dependency
  **Resolution**: Installed as dev dependency with `npm install -D autoprefixer`
- **Issue**: Input text was white on white background in GridEditor
  **Resolution**: Added `text-slate-900 bg-white` classes to all input fields for proper contrast
- **Note**: Used manual Next.js initialization instead of `create-next-app` to preserve existing project structure (BMad Method files)

### Completion Notes
- All tasks completed successfully
- Build passes without errors
- Dexie database schema matches architecture specifications
- App Shell implements responsive sidebar with Zustand state management
- Grid Editor supports full CRUD operations with validation
- UI follows Dark Slate theme with proper touch targets (44px minimum)

### File List
**Created Files:**
- `package.json` - Updated with Next.js dependencies
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Jest setup with polyfills
- `lib/db.ts` - Dexie database setup with schema
- `lib/__tests__/db.test.ts` - Database tests (9 tests)
- `stores/useGlobalStore.ts` - Zustand global state store
- `stores/__tests__/useGlobalStore.test.ts` - Store tests (4 tests)
- `app/globals.css` - Global styles with Dark Slate theme
- `app/layout.tsx` - App Shell with Header and Sidebar
- `app/page.tsx` - Home page
- `app/grids/page.tsx` - Grids list page
- `app/grids/new/page.tsx` - New grid page
- `components/grids/GridEditor.tsx` - Grid editor component
- `components/grids/__tests__/GridEditor.test.tsx` - GridEditor tests (11 tests)

### Change Log
- **2026-01-06**: Initial project setup completed
  - Next.js 15.1.3 with TypeScript
  - Dexie 4.0.11 for IndexedDB
  - Zustand 5.0.2 for state management
  - Tailwind CSS 3.4.17 for styling
  - Lucide React 0.469.0 for icons
- **2026-01-06**: Database layer implemented
  - 4 tables: grids, students, exams, grades
  - Type-safe interfaces for all entities
  - Singleton db instance exported
- **2026-01-06**: App Shell completed
  - Collapsible sidebar with navigation
  - Sticky header with sync status indicator
  - Responsive layout (mobile/tablet/desktop)
- **2026-01-06**: Grid Editor CRUD implemented
  - Create/list/delete grids
  - Dynamic competency and indicator management
  - Critical indicator toggle
  - Validation before save
  - Persistence to IndexedDB via Dexie
- **2026-01-06**: Unit tests implemented
  - Jest + React Testing Library configured
  - Database tests: 9 tests covering CRUD operations
  - Store tests: 4 tests covering state management
  - Component tests: 11 tests covering GridEditor functionality
  - Total: 24 tests, all passing ✓
  - Test coverage for critical business logic

## QA Results

### Review Date: 2026-03-09

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

**Overall: GOOD** — Solid foundational story. Database schema matches architecture spec, App Shell is responsive with proper Dark Slate theme, GridEditor supports full CRUD with validation. Code follows standard Next.js/React patterns and Tailwind conventions.

**Strengths:**
- Clean separation: `lib/db.ts` (data), `stores/useGlobalStore.ts` (state), `components/` (UI)
- GridEditor has proper validation before save (title, competency labels, indicator text)
- Touch targets correctly sized (py-3, p-3, h-12) for tablet use
- `generateId()` fallback for environments without `crypto.randomUUID` is a nice defensive pattern

**Observations:**
- `layout.tsx` imports `Metadata` type but it's unused (it's a client component, metadata export won't work)
- `app/grids/page.tsx` uses English labels ("Grading Grids", "Create New Grid") while GridEditor uses French — inconsistent i18n
- Delete confirmation uses browser `confirm()` / `alert()` — functional but not polished

### Refactoring Performed

None — Story 1 is foundational and widely depended upon. No refactoring during review to avoid regression risk.

### Compliance Check

- Coding Standards: ✓ Follows Tailwind + Next.js conventions consistently
- Project Structure: ✓ Files in correct locations (`lib/`, `stores/`, `components/grids/`, `app/grids/`)
- Testing Strategy: ✓ 24 tests covering DB, state, and component layers (note: tests use Jest, not Vitest — pre-existing config)
- All ACs Met: ✓
  - AC1: Project builds ✓
  - AC2: Database created in IndexedDB ✓
  - AC3: Can create Grid with competencies + indicators ✓
  - AC4: Grid persists after reload (Dexie/IndexedDB) ✓
  - AC5: Dark Slate theme applied ✓

### Improvements Checklist

- [ ] Remove unused `Metadata` import from `layout.tsx` (minor)
- [ ] Harmonize language — choose French or English for UI labels consistently
- [ ] Consider replacing `confirm()`/`alert()` with modal dialogs in future stories

### Security Review

No concerns. Local-first architecture with no API calls. No user input reaches server-side code.

### Performance Considerations

No concerns. Dexie queries are simple key lookups. No large datasets expected at this stage.

### Files Modified During Review

None.

### Gate Status

Gate: PASS → docs/qa/gates/1-core-setup.yml

### Recommended Status

✓ Ready for Done — All acceptance criteria met, 24 tests passing, solid foundation.
