# PEQ_Grader Product Requirements Document (PRD)

**Version:** 1.0
**Date:** 2026-01-06
**Status:** DRAFT

## 1. Goals and Background Context
### Goals
*   Provide a robust **Local-First** grading solution that works offline on tablets and PCs.
*   Enable **Non-linear Grading**: Allow teachers to switch instantly between students and competencies (Matrix View).
*   Digitize the **PEQ Assessment Logic**: Support "Acquis/Non-Acquis" decisions grounded in specific indicators.
*   Ensure **Flexibility**: Import grids from Excel/CSV *and* create/edit them directly in the app.
*   Deliver **Standardized Outputs**: Generate PDF reports as the official record of the exam.

### Background Context
The "Parcours d'Enseignement Qualifiant" (PEQ) in Belgian technical schools requires rigorous assessment of student competencies. Currently, this process is paper-heavy and inefficient in a workshop environment where teachers need mobility. The "PEQ_Grader" aims to replace the clipboard with a tablet, offering a digital interface that respects the teacher's professional judgment (assisting rather than automating the final decision) and simplifies the administrative burden of consolidating results.

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2026-01-06 | 1.0 | Initial Draft (YOLO/Brainstorming Output) | Analyst Agent |

## 2. Requirements

### Functional Requirements
1.  **FR1 - Grid Management (Hybrid):** 
    *   **Import:** Parse Excel/CSV files to generate `GradingGrid` objects.
    *   **Edit:** UI to add/remove Competencies and Indicators.
    *   **Versioning:** Grids are immutable once used in an Exam to prevent data corruption.
2.  **FR2 - Student Management:** 
    *   CRUD operations for Students (IndexDB).
    *   Import Class list via CSV.
3.  **FR3 - Matrix Dashboard:** 
    *   Rows: Students. Columns: Competencies.
    *   Cells: Color-coded status (Gray=Empty, Orange=Partial, Green=Acquis, Red=Non-Acquis).
    *   **Performance:** must render instantly for 20 students x 10 competencies.
4.  **FR4 - Matrix Navigation:** 
    *   Tap Cell -> Open Modal (Student X Competency).
    *   Swipe Left/Right in Modal -> Navigate to next/prev Student for same Competency.
    *   Swipe Up/Down in Modal -> Navigate to next/prev Competency for same Student.
5.  **FR5 - Grading Logic (Assistant Mode):**
    *   Teacher taps Indicators (Boolean toggle).
    *   System calculates a "Suggested Status" based on strictness rules (e.g., "All Critical Indicators checked").
    *   Teacher confirms or overrides the Final `Acquis` / `Non-Acquis` status.
6.  **FR6 - Local-First Storage:** 
    *   Primary store: **IndexedDB** (via Dexie.js) for structured data.
    *   Redundancy: Export DB dump to JSON file.
7.  **FR7 - Reporting:** 
    *   Generate PDF per student (Diplomat style).
    *   Include School Header, Student Info, Grid details, and Final Decision.

### Non-Functional Requirements
1.  **Tablet Optimized:** Minimum touch target size 44x44px. No hover effects for critical actions.
2.  **Offline-First:** Service Worker caches shell; IndexedDB stores data. App loads with 0 request latency.
3.  **Data Safety:** Auto-save to IndexedDB on `onChange`. Visual indicator "Saved" in UI.

## 3. Data Model (Schema Definition)
*Drafting the JSON structures to guide the Dexie.js schema.*

### 3.1. Master Data (The Setup)
```typescript
// The Reference Grid
interface GradingGrid {
  id: string; // UUID
  title: string; // e.g., "Soudure à l'arc 2024"
  createdAt: string; // ISO Date
  competencies: Competency[];
}

interface Competency {
  id: string; // UUID
  shortCode: string; // e.g., "C1"
  label: string; // "Préparer le poste de travail"
  indicators: Indicator[];
}

interface Indicator {
  id: string;
  text: string; // "Vérifier l'arrivée de gaz"
  isCritical: boolean; // If true, requires special attention
}

// The Class List
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classGroup: string; // "5TB"
}
```

### 3.2. Operational Data (The Exam)
```typescript
interface ExamSession {
  id: string;
  gridId: string; // Link to specific grid version
  date: string;
  label: string; // "Examen Juin 2026"
  studentIds: string[]; // List of students enrolled in this exam
}
```

### 3.3. Transactional Data (The Grades)
```typescript
interface GradeRecord {
  // Composite Key: [examId + studentId + competencyId]
  examId: string;
  studentId: string;
  competencyId: string;
  
  // Evidence
  checkedIndicatorIds: string[]; // List of IDs ticked by teacher
  
  // Verdict
  status: 'PENDING' | 'ACQUIS' | 'NON_ACQUIS' | 'REMEDIATION';
  teacherComment?: string;
  
  updatedAt: number; // Timestamp for sync/merge potential
}
```

## 4. Business Logic & Rules
### 4.1. "Computed Status" Logic
The system acts as an **Assistant**. It does not enforce the grade but suggests it.
*   **Rule 1:** If **ANY** Critical Indicator is missing -> Suggest `NON_ACQUIS`.
*   **Rule 2:** If **> X%** of Standard Indicators are missing -> Suggest `REMEDIATION`.
*   **Override:** The Teacher always has the final button press. If the teacher marks `ACQUIS` despite missing critical indicators, the system prompts for a comment (Justification).

### 4.2. Exam Completion
*   An Exam is "Complete" for a student when **ALL** Competencies have a status other than `PENDING`.
*   PDF Export is only enabled for Students with "Complete" status (or with a warning).

## 5. System Architecture & Flow

### 5.1. Tech Stack
*   **Frontend:** Next.js 14+ (App Router).
*   **Styling:** Tailwind CSS (Heavy use of `grid`, `touch-`, and `h-screen` classes).
*   **Local DB:** Dexie.js (Wrapper for IndexedDB) - **Source of Truth**.
*   **State Management:** Zustand (for ephemeral UI state like "Modal Open", "Current Filtering").
*   **PDF:** `react-pdf/renderer` (Client-side generation).

### 5.2. Routing Structure
*   `/` -> Dashboard (List of Exams).
*   `/exams/new` -> Wizard to create Exam (Select Grid + Select Students).
*   `/exams/[examId]` -> **The Matrix View** (Main Controller).
*   `/exams/[examId]/grade/[studentId]/[competencyId]` -> **Grading Modal/Page** (Deep linkable for safety, but UI will likely be a modal overlay).

### 5.3. Data Flow
1.  **Init:** User loads app. `useEffect` hydrates Zustand store from Dexie.
2.  **Action:** User ticks box.
3.  **Write:** Immediate write to Dexie (`db.grades.put(...)`).
4.  **Reflect:** Live Query (useLiveQuery from Dexie) updates the Matrix View instantly.

## 6. Next Steps
*   **Architect:** Validate the Schema in the code.
*   **Frontend:** Setup Next.js + Tailwind + Dexie.
*   **Prototype:** Build the **Competency Editor** (JSON generator) and **The Matrix** to test performance.
