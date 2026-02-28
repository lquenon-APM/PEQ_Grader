# Project Brief: PEQ_Grader

**Date:** 2026-01-06
**Status:** DRAFT (YOLO Mode)

## 1. Introduction
This document defines the **PEQ_Grader** project. It serves as the foundational input for product development, based on the requirements of a Workshop Head in a Belgian Technical Secondary School. The project focuses on digitizing the "Parcours d'Enseignement Qualifiant" (PEQ) assessment process.

## 2. Executive Summary
**PEQ_Grader** is a tablet-first application designed to modernize and automate the grading of practical exams in Belgian technical secondary education (PEQ). It solves the inefficiency of paper-based grading by providing an intuitive, touch-optimized interface for teachers to assess student competencies ("Acquis", "Non Acquis", "En voie d'acquisition") in real-time. The primary value is streamlining the qualification process and ensuring accurate, digitized record-keeping of student skills.

## 3. Problem Statement
*   **Current State:** Grading PEQ exams is likely manual or involves disjointed tools not adapted for workshop environments.
*   **Pain Points:**
    *   Difficulty in managing complex grading grids (Competencies vs. Indicators).
    *   Lack of mobility: Teachers need to move around the workshop/student station.
    *   Administrative burden in consolidating results for qualification.
*   **Urgency:** With the transition to PEQ, compliance and efficiency in validitating student skills are critical for issuing diplomas.

## 4. Proposed Solution
A **web/mobile application** optimized for tablets (touch interface) that runs equally well on PCs.
*   **Core Concept:** A digital clipboard. The teacher loads an exam, selects a student, and taps to grade competencies as they observe the student.
*   **Key Differentiators:**
    *   **Mobile/Touch First:** Big buttons, easy navigation, designed for use while standing/walking.
    *   **PEQ Specific:** Natively handles the "Acquis/Non Acquis" logic and Belgian education terminology.
    *   **Versatile:** Works on the workshop tablet and the office PC for setup/admin.

## 5. Target Users
### Primary Segment: The Workshop Teacher / Head of Workshop
*   **Context:** Works in a technical school (atelier/workshop).
*   **Behavior:** Moves around during exams, observes practical tasks.
*   **Needs:** Fast input (minimal typing during grading), clear overview of criteria, reliability (no data loss).
*   **Goals:** Validate student skills efficiently against official grids.

## 6. Goals & Success Metrics
### Business Objectives
*   Simplify the administration of PEQ assessments.
*   Ensure standardization of grading grids across the school/department.

### User Success Metrics
*   **Time to Grade:** Reduction in time spent on administrative tasks post-exam.
*   **Accuracy:** Fewer errors in calculating qualification status.

## 7. MVP Scope
### Core Features (Must Have)
*   **Grid Management:** Create/Edit grading grids (competencies, indicators).
*   **Student Management:** Import/Create list of students.
*   **Grading Interface (Tablet Mode):**
    *   Select Student > Select Exam.
    *   Touch-friendly rubric view.
    *   Toggle interaction for "Acquis" / "Non Acquis" / "En voie".
*   **Result Persistence:** Save and view grades.
*   **Platform Support:** Responsive Web App (PWA) accessible via Browser on Tablet and PC.

### Out of Scope for MVP
*   Complex integrations with external school management systems (starting standalone).
*   Advanced analytics/reporting dashboards (basic results only).
*   Student portal/login (Teacher-facing only for now).

## 8. Technical Considerations
### Platform Requirements
*   **Target Platforms:** Tablets (iPad/Android) and Desktop (Windows/Mac).
*   **Tech Stack Preference (Suggested):**
    *   **Frontend:** React (Next.js) with Tailwind CSS (for easy, responsive, high-contrast UI).
    *   **Backend:** Node.js or simply a local-first/backend-as-a-service approach (like Supabase or Firebase) for real-time sync and ease of setup. *To be refined in PRD.*
*   **Hardware:** usage of Touchscreen is mandatory for the grading view.

## 9. Constraints & Assumptions
### Constraints
*   **Environment:** Must work effectively on a tablet screen size.
*   **OS:** Agnostic (Web-based preferred to cover both iOS/Android/Windows tablets).

### Assumptions
*   Internet connection is available in the workshop (or offline mode might be needed - to be discussed).
*   The "Grading Logic" implies that indicators sum up to a competency status (rules to be defined).

## 10. Risks & Open Questions
*   **Offline Access:** Does wifi work reliably in the workshops? (Critical for a web app).
*   **Data Privacy:** Handling student names and grades (GDPR compliance).
*   **Logic Specifics:** What are the exact rules for "En voie d'acquisition"? Does it count as a fail?

## 11. Next Steps
1.  **Review this Brief:** Confirm the scope and understanding.
2.  **Generate PRD:** Detail the specific logic of grading and screen flows.
3.  **Prototype:** Build the Grading UI first to test usability on a tablet.
