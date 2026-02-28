# Front-End Specification: PEQ_Grader

**Version:** 1.0
**Status:** DRAFT
**Based on:** Architecture v1.0

## 1. Design System (The "Workshop" Theme) 🛠️
*Goal: High contrast, large touch targets, industrial/clean aesthetic.*

### 1.1. Color Palette (Tailwind)
*   **Primary (Brand):** `slate-900` (Structure), `blue-600` (Action).
*   **Status Colors (The PEQ Traffic Light):**
    *   **Acquis (Pass):** `emerald-600` (bg-emerald-600) / `emerald-100` (bg-emerald-100 for subtle).
    *   **Non Acquis (Fail):** `rose-600` / `rose-100`.
    *   **Remediation (Warning):** `amber-500` / `amber-100`.
    *   **Pending/Empty:** `slate-200` (bg-slate-200).
*   **Text:** `slate-800` (Base), `slate-500` (Muted).

### 1.2. Typography
*   **Font:** Inter (or System Sans).
*   **Scale:**
    *   `text-xs` (Labels not meant for reading while walking).
    *   `text-lg` / `text-xl` (Student Names, Statuses - **Readable at arm's length**).

### 1.3. Touch Targets (Critical)
*   **Minimum Size:** 44px (w-11 h-11).
*   **Standard Button:** `h-12` or `h-14`.
*   **Grid Cell:** Min `h-16 w-16` to allow easy tapping.

---

## 2. Global Layout
*A minimalist shell to maximize screen real estate for the "Grid".*

### 2.1. The App Shell
*   **Header (Sticky):**
    *   Left: App Logo + Current Page Title (e.g., "Soudure 5TB").
    *   Right: "Sync/Export" Status Indicator (Green/Red dot).
*   **Navigation:**
    *   **Tablet/Desktop:** Sidebar (Collapsible).
    *   **Mobile:** Bottom Bar (though primary use case is Tablet).
*   **Content Area:** Scrollable container.

---

## 3. Screen Specifications

### 3.1. Dashboard (`/`)
*   **Purpose:** List recent Exams and quick actions.
*   **Components:**
    *   `ExamCard`: Displays "Class Name", "Grid Name", "Date", "Completion %".
    *   `FloatingActionButton (FAB)`: "+ New Exam".

### 3.2. Exam Wizard (`/exams/new`)
*   **Purpose:** Setup a new session.
*   **Flow:**
    1.  **Step 1: Select Grid.** List of available Templates. Searchable.
    2.  **Step 2: Session Info.** Date picker, Custom Label (e.g. "Juin 2026").
    3.  **Step 3: Select Students.** Checklist of students. "Select All" / Filter by Class.
*   **Validation:** "Create" button disabled until all steps valid.

### 3.3. The Matrix View (`/exams/[id]`) 🟥🟧🟩
*   **The Core Interface.**
*   **Layout:** Frozen Header (Competencies) + Left Column (Student Names).
*   **Interaction:**
    *   Two-finger scroll to pan.
    *   **Tap Cell:** Opens `GradingModal`.
*   **Visuals:**
    *   Cell Content: Simple Icon or Abbreviation (e.g., "A", "NA") + Background Color.
    *   Progress Row: "8/10 Students Graded".

### 3.4. Grading Modal (The "Clipboard")
*   **Context:** Overlay appearing when clicking a Cell (Student X + Comp Y).
*   **Layout:**
    *   **Header:** Student Name + Competency Title.
    *   **Body (Scrollable):** List of `IndicatorRow`.
*   **`IndicatorRow` Component:**
    *   Left: Indicator Text.
    *   Right: Large Toggle Switch (Yes/No).
    *   Badge: "CRITICAL" (Red badge) if applicable.
*   **Footer (The Verdict):**
    *   **Computed Suggestion:** "Status: Acquis" (Auto-calculated).
    *   **Override Controls:** Segmented Control [Acquis | En Voie | Non Acquis].
    *   **Navigation:** Buttons "< Previous Student" and "Next Student >" (for rapid sequential grading).

---

## 4. Component States

### 4.1. Buttons
*   **Default:** Blue-600, White Text.
*   **Active/Pressed:** Scale 95%.
*   **Disabled:** Slate-300, Cursor-not-allowed.

### 4.2. Toasts (Notifications)
*   **Position:** Bottom-Right.
*   **Types:**
    *   Success: "Saved locally."
    *   Error: "Export failed."
