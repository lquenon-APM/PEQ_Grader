---
id: STORY-2
title: Student Management & Exam Creation
status: Done
priority: High
epic: EPIC-1
---

# User Story: Student Management & Exam Creation

**As a** Teacher
**I want to** manage my class lists and schedule new exams
**So that** I can start grading students using the predefined grids.

## Context
With the "Grid Manager" (Story 1) complete, we now need the "Operational Data": Students and Exams.
This story covers the "Setup" phase before the actual grading happens.
It involves two key features:
1.  **Student Manager**: Importing lists of students (CSV) or adding them manually.
2.  **Exam Wizard**: A workflow to create an `Exam` object by selecting a `Grid`, a Date, and a list of `Students`.

## References
*   [Architecture Document](../architecture.md) (Section 3.2: `students` and `exams` schemas)
*   [Front-End Spec](../architecture/front-end-spec.md) (Section 3.2: Exam Wizard)

## Tasks
- [x] **Implement Student Management** <!-- id: 1 -->
    - Create `app/students/page.tsx`: List existing students.
    - Create `components/students/StudentForm.tsx`: Add/Edit commands.
    - **CSV Import Feature**:
        - Create `lib/csv.ts`: Helper to parse user-uploaded CSV (`firstName, lastName, group`).
        - UI Action: "Import CSV" button.

- [x] **Implement Exam Listing (Dashboard)** <!-- id: 2 -->
    - Update `app/page.tsx` (Dashboard):
        - Fetch list of Exams from `db.exams`.
        - Display as Cards: `Date` | `Grid Name` | `Group` | `Status`.
        - Add FAB (Floating Action Button): "+ New Exam".

- [x] **Implement Exam Wizard (Multi-Step Form)** <!-- id: 3 -->
    - Create `app/exams/new/page.tsx`.
    - **Step 1: Protocol**: Select a `Grid` from the database.
    - **Step 2: Metadata**: Pick Date and Name (e.g., "Juin 2024").
    - **Step 3: Candidates**: Select Students (Checkbox list with "Select All" / Filter by Group).
    - **Step 4: Finalize**:
        - Construct `Exam` object.
        - **CRITICAL**: Copy the `Grid.structure` into `Exam.frozenGridStructure` (Copy-on-Write pattern).
        - Save to `db.exams`.
        - Redirect to Dashboard or the Exam View.

## Acceptance Criteria
- [x] I can upload a CSV with 20 students and see them in the list.
- [x] I can create a new Exam, selecting "Grid A" and "Student Group B".
- [x] The Dashboard lists the created Exam.
- [x] **Data Integrity**: Inspecting the `Exam` in IndexedDB shows `frozenGridStructure` is populated (not null).

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log
None — implementation was already complete from prior development sessions.

### File List
| File | Status | Description |
|------|--------|-------------|
| `app/students/page.tsx` | EXISTS | Student list with group headers, CSV import button |
| `app/students/new/page.tsx` | EXISTS | New student page |
| `app/students/[id]/page.tsx` | EXISTS | Edit student page |
| `components/students/StudentForm.tsx` | EXISTS | Add/Edit student form with validation |
| `components/students/StudentCard.tsx` | EXISTS | Student display card with delete |
| `components/students/CSVImporter.tsx` | EXISTS | CSV import modal (firstName, lastName, group) |
| `app/page.tsx` | EXISTS | Dashboard with ExamCard list + FAB |
| `app/exams/new/page.tsx` | EXISTS | New exam page wrapping ExamWizard |
| `components/exams/ExamWizard.tsx` | EXISTS | 4-step wizard: Grid → Metadata → Students → Confirm |
| `components/exams/ExamCard.tsx` | EXISTS | Exam display card |
| `components/exams/FloatingActionButton.tsx` | EXISTS | FAB component for "New Exam" |

### Completion Notes
- All code was already implemented from prior development sessions (Stories 3 & 4 depend on this)
- CSV parsing is inline in CSVImporter.tsx (not in separate lib/csv.ts — minor deviation from task spec, but functionally equivalent)
- ExamWizard uses `structuredClone()` for frozenGridStructure copy-on-write pattern
- Student list grouped by group with count badges
- Story retroactively marked Done after verification of all ACs

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-09 | 1.0 | Retroactive completion — all tasks verified as implemented | Dev Agent (James) |
