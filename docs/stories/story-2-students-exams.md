---
id: STORY-2
title: Student Management & Exam Creation
status: Draft
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
- [ ] **Implement Student Management** <!-- id: 1 -->
    - Create `app/students/page.tsx`: List existing students.
    - Create `components/students/StudentForm.tsx`: Add/Edit commands.
    - **CSV Import Feature**:
        - Create `lib/csv.ts`: Helper to parse user-uploaded CSV (`firstName, lastName, group`).
        - UI Action: "Import CSV" button.

- [ ] **Implement Exam Listing (Dashboard)** <!-- id: 2 -->
    - Update `app/page.tsx` (Dashboard):
        - Fetch list of Exams from `db.exams`.
        - Display as Cards: `Date` | `Grid Name` | `Group` | `Status`.
        - Add FAB (Floating Action Button): "+ New Exam".

- [ ] **Implement Exam Wizard (Multi-Step Form)** <!-- id: 3 -->
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
- [ ] I can upload a CSV with 20 students and see them in the list.
- [ ] I can create a new Exam, selecting "Grid A" and "Student Group B".
- [ ] The Dashboard lists the created Exam.
- [ ] **Data Integrity**: Inspecting the `Exam` in IndexedDB shows `frozenGridStructure` is populated (not null).

## Dev Agent Record
### Debug Log
*(Populate during development)*

### Change Log
*(Populate during development)*
