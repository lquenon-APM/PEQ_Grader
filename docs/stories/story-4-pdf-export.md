---
id: STORY-4
title: PDF Export & Exam Closure
status: Done
priority: High
epic: EPIC-3
---

# User Story: PDF Export & Exam Closure

**As a** Teacher
**I want to** generate official PDF reports and close my exam
**So that** I have a permanent, unalterable record of the assessment.

## Context
Grading is complete. Now the teacher needs to produce the "Diplomat" PDF (the official document for the school) and mark the exam as "Closed" to prevent any further modifications.

## Requirements
### 1. PDF Generation (The "Diplomat" Report)
- Use `react-pdf/renderer` or a similar client-side library.
- **Header**: School name (Placeholder), Student Name, Date, Grid Title.
- **Body**: 
    - List of Competencies.
    - For each: Verdict (Acquis/Non-Acquis) and checked indicators.
    - Teacher observations.
- **Footer**: Final result and space for signature.

### 2. Exam Status Management
- Add a "Close Exam" button on the Dashboard/Matrix View.
- Once closed, all grading buttons must be disabled (Read-only mode).
- Visual indicator: "Status: ARCHIVED".

### 3. Bulk Action
- Button: "Download All PDFs (ZIP)" to save time.

## Tasks & Assignments

### 🛡️ Architect
- [x] Select the PDF library and define the `PDFTemplate` structure.
- [x] Update `Exam` schema if necessary to include `status: 'OPEN' | 'CLOSED'`.

### 💻 Developer
- [x] Implement the PDF generation logic in `components/exams/PDFReport.tsx`.
- [x] Add "Lock/Unlock" logic to the database and UI.

### 🎨 UX Expert
- [x] Design a clean, academic-looking PDF layout.
- [x] Add a "Success" state after closing an exam.

### 🧪 QA
- [x] Verify that PDF contains ALL checked indicators and observations.
- [x] Ensure no modifications are possible once the exam is "CLOSED".

## Acceptance Criteria
- [x] Clicking "Export PDF" for a student opens a valid, printable PDF.
- [x] Closing the exam makes the `MatrixView` non-editable.
- [x] The PDF layout matches the official school requirements (Placeholder format).
