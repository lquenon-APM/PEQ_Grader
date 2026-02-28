# AI UI Generation Prompt - PEQ_Grader

**Goal:** Create a tablet-first, local-first grading application for vocational workshops.
**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, Lucide React Icons.
**Design Theme:** Industrial, Clean, High Contrast. "Dark Slate" branding.

---

## 1. Context & Design System
You are building the frontend for "PEQ_Grader". It replaces a clipboard for teachers in a mechanic's workshop.
**Constraints:**
-   **Touch Targets:** Must be at least 44px x 44px.
-   **Typography:** Large, readable fonts (Inter or System Sans).
-   **Colors:**
    -   Background: `bg-slate-50`
    -   Primary/Header: `bg-slate-900` text-white
    -   Status "Acquis" (Pass): `bg-emerald-600`
    -   Status "Non Acquis" (Fail): `bg-rose-600`
    -   Status "Remediation": `bg-amber-500`

## 2. Components to Generate

### A. The App Shell
Create a Layout with:
1.  **Sticky Header:** Dark Slate background (`slate-900`). Contains "PEQ Grader" logo (left) and a "Sync Status" dot (right).
2.  **Navigation:** A collapsible Sidebar on the left (hidden on mobile, visible on tablet). usage: `w-64`. Links: "Dashboard", "Classes", "Settings".

### B. The "Matrix View" (Complex Table)
Create a responsive Data Grid component representing a class exam.
-   **Rows:** Student Names (sticky left column).
-   **Columns:** Competencies (C1, C2, C3...).
-   **Cells:** Color-coded squares.
    -   If status is "Acquis" -> Green square with "A".
    -   If status is "Non Acquis" -> Red square with "NA".
    -   If Empty -> Gray square (`slate-200`).
-   **Interaction:** Tapping a cell simulates opening a modal.

### C. The Grading Modal (The Clipboard)
Create a Modal/Dialog component overlaid on the screen.
-   **Header:** "Student: John Doe - Competency: C1 (Safety)".
-   **Body:** A list of "Indicators".
    -   Each row has text (e.g., "Wears safety glasses") and a LARGE Toggle Switch.
    -   Some rows have a "CRITICAL" red badge next to the text.
-   **Footer:**
    -   **Computed Result:** Text "Suggested: Acquis" (Green).
    -   **Override:** A Segmented Control [Acquis | En Voie | Non Acquis].
    -   **Navigation:** Large buttons `Previous Student` and `Next Student`.

## 3. Strict Rules
-   Use `lucide-react` for icons (check, x, alert-circle, menu).
-   Do NOT implement backend logic, just the visual React components.
-   Ensure buttons have `active:scale-95` transform for tactile feel.
-   Use standard Tailwind spacing (p-4, gap-4).

---

**Instruction:** Generate the React code (using standard Tailwind classes) for the **Grading Modal** first, as it's the most critical touch interface.
