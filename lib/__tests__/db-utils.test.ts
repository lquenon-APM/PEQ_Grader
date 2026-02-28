import { db } from "../db";
import { exportFullDatabase, resetDatabase, importDatabase } from "../db-utils";

describe("Database Utilities", () => {
  beforeEach(async () => {
    await db.grids.clear();
    await db.students.clear();
    await db.exams.clear();
    await db.grades.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  it("should export the database content as a JSON blob", async () => {
    // Add some data
    await db.students.add({ id: "s1", firstName: "John", lastName: "Doe", group: "A" });
    await db.grids.add({ 
      id: "g1", 
      name: "Grid 1", 
      structure: { competencies: [] }, 
      version: 1 
    });

    const blob = await exportFullDatabase();
    expect(blob.type).toBe("application/json");

    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(blob);
    });
    const data = JSON.parse(text);

    expect(data.version).toBe(1);
    expect(data.tables.students).toHaveLength(1);
    expect(data.tables.students[0].firstName).toBe("John");
    expect(data.tables.grids).toHaveLength(1);
  });

  it("should reset all tables in the database", async () => {
    await db.students.add({ id: "s1", firstName: "John", lastName: "Doe", group: "A" });
    await db.grids.add({ id: "g1", name: "Grid 1", structure: { competencies: [] }, version: 1 });

    await resetDatabase();

    const students = await db.students.toArray();
    const grids = await db.grids.toArray();

    expect(students).toHaveLength(0);
    expect(grids).toHaveLength(0);
  });

  it("should import data from a JSON string and overwrite existing data", async () => {
    // 1. Setup initial data
    await db.students.add({ id: "old", firstName: "Old", lastName: "Student", group: "X" });

    // 2. Prepare import data
    const importData = {
      version: 1,
      tables: {
        students: [{ id: "new", firstName: "New", lastName: "Student", group: "Y" }],
        grids: [],
        exams: [],
        grades: []
      }
    };

    // 3. Execute import
    await importDatabase(JSON.stringify(importData));

    // 4. Verify
    const students = await db.students.toArray();
    expect(students).toHaveLength(1);
    expect(students[0].id).toBe("new");
    expect(students[0].firstName).toBe("New");
  });

  it("should throw an error if import data format is invalid", async () => {
    const invalidData = JSON.stringify({ wrong: "format" });
    await expect(importDatabase(invalidData)).rejects.toThrow();
  });
});
