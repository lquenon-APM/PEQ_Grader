import Dexie, { type EntityTable } from "dexie";

// Type Definitions
export interface Grid {
  id: string;
  name: string;
  structure: {
    competencies: Array<{
      id: string;
      label: string;
      indicators: Array<{
        id: string;
        text: string;
        critical: boolean;
      }>;
    }>;
  };
  version: number;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  group: string;
  birthDate?: string; // ISO date string
}

export interface Exam {
  id: string;
  date: string;
  label: string;
  gridName: string;
  frozenGridStructure: Grid["structure"];
  studentIds: string[];
  status: "OPEN" | "CLOSED"; // Added for Story 4
  closedAt?: string; // ISO date string
}

export interface Grade {
  pk: string; // Compound key: `${examId}+${studentId}+${competencyId}`
  examId: string;
  studentId: string;
  competencyId: string;
  status: "PENDING" | "ACQUIS" | "NON_ACQUIS" | "REMEDIATION";
  data: string; // JSON stringified: { checkedIndicatorIds, observations, timestamp }
}

// Database Class
class PEQGraderDatabase extends Dexie {
  grids!: EntityTable<Grid, "id">;
  students!: EntityTable<Student, "id">;
  exams!: EntityTable<Exam, "id">;
  grades!: EntityTable<Grade, "pk">;

  constructor() {
    super("PEQGraderDB");

    // Versioning the DB to v3 for the new status field
    this.version(3).stores({
      grids: "id, name, version",
      students: "id, firstName, lastName, group, birthDate",
      exams: "id, date, label, status",
      grades: "pk, examId, studentId, competencyId, status",
    });
  }
}

// Singleton instance
export const db = new PEQGraderDatabase();
