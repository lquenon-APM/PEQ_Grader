---
id: STORY-3
title: Logic & Grading Assistant
status: Done
priority: High
epic: EPIC-2
---

# User Story: Logic & Grading Assistant

**As a** Teacher
**I want to** be assisted during the grading process
**So that** I can make fair and fast decisions based on objective indicators.

## Context
The basic `MatrixView` and `GradingModal` exist, but they are purely manual. We need to implement the "Assistant Mode" which suggests a status based on the strictness rules (Critical Indicators) and improve the UX for tablet usage (navigation).

## Requirements
### 1. The Suggestion Engine (Business Logic)
- **Rule A (Critical)**: If any indicator marked as `critical` is NOT checked -> Suggest `NON_ACQUIS`.
- **Rule B (Completion)**: If < 100% of indicators are checked but all criticals are OK -> Suggest `REMEDIATION`.
- **Rule C (Success)**: If 100% of indicators are checked -> Suggest `ACQUIS`.
- **Visual Feedback**: The suggested button in `GradingModal` should "pulse" or be highlighted.

### 2. Fast Navigation (UX)
- Add "Previous Student" / "Next Student" arrows in the `GradingModal`.
- Ensure the state (checked indicators) is saved automatically or prompted before switching.

### 3. Data Integrity & Persistence
- Ensure `db.grades` is updated correctly with the `data` JSON string.
- Update `MatrixView` in real-time when a student is graded.

## Tasks & Assignments

### 🛡️ Architect
- [x] Define the `calculateSuggestedStatus` utility function in `lib/logic.ts`.
- [x] Design the navigation state for switching students within the modal.

### 💻 Developer
- [x] Implement the suggestion engine in `GradingModal.tsx`.
- [x] Add navigation controls (Arrows) to the Modal.
- [x] Implement auto-save on indicator toggle (Local-First best practice).

### 🎨 UX Expert
- [x] Optimize the layout of `GradingModal` for 10-inch tablets.
- [x] Design the "Suggestion Highlight" animation.

### 🧪 QA
- [x] Verify that missing a critical indicator ALWAYS suggests `NON_ACQUIS`.
- [x] Test rapid navigation between 10+ students to ensure no data loss.

## Acceptance Criteria
- [x] Toggling a "Critical" indicator instantly changes the suggested verdict.
- [x] I can grade an entire class of 20 students by clicking "Next" without closing the modal.
- [x] The `MatrixView` reflects the status (colors) immediately after each save.
