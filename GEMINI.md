# PEQ Grader - Project Context

## Overview
PEQ Grader is a modern "Local-First" web application designed for teachers to manage exams, students, and grading grids. It is optimized for tablet use in technical workshops (PEQ - Parcours d'Enseignement Qualifiant).
# PEQ Grader - Project Progress

## Current Status: Version 1.0 (Production Ready)
The project has successfully completed all initial development phases. It is a fully functional Local-First web application for technical workshop grading.

### Key Features Implemented:
- **Local-First Database**: Persistent offline storage using Dexie.js (IndexedDB).
- **Student Management**: CSV Import, manual entry, and class group management.
- **Grid Editor**: Visual creation of complex grading structures with critical indicators.
- **Grading Assistant**: Real-time logic suggestions based on PEQ rules (missing critical = fail).
- **Matrix View**: High-performance dashboard for rapid assessment and swiping between students.
- **Official Reports**: Client-side PDF generation ("Diplomat" format) for official documentation.
- **Exam Lifecycle**: Opening, closing, and locking exams for data integrity.

### Technical Debt & Future Improvements:
- [x] Implement advanced remediation logic with 75% success threshold (Story 6).
- [ ] Implement cloud synchronization for backup (Optional).
- [ ] Multi-language support (i18n).

---
*Last updated: 2026-02-28*

## Directory Structure
- `app/`: Next.js pages and routes.
    - `app/students/`: List, creation, and detail pages.
    - `app/grids/`: Management and editor.
    - `app/exams/`: Exam session management.
- `components/`: Feature-specific UI components.
- `lib/db.ts`: IndexedDB schema and Dexie configuration.
- `stores/`: Zustand global state (UI state).
- `docs/`: PRD, Brief, and architecture documentation.

## Main Scripts
- `npm run dev`: Starts development server.
- `npm test`: Runs the test suite (Form & CSV Import coverage).
- `npm run build`: Production build.