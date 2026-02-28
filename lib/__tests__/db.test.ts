import { db } from '../db';
import type { Grid } from '../db';

describe('Dexie Database', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.grids.clear();
    await db.students.clear();
    await db.exams.clear();
    await db.grades.clear();
  });

  afterAll(async () => {
    // Close database connection after all tests
    await db.close();
  });

  describe('Grids Table', () => {
    it('should add a grid to the database', async () => {
      const grid: Grid = {
        id: 'grid-1',
        name: 'Test Grid',
        structure: {
          competencies: [
            {
              id: 'comp-1',
              label: 'Competency 1',
              indicators: [
                { id: 'ind-1', text: 'Indicator 1', critical: false },
                { id: 'ind-2', text: 'Indicator 2', critical: true },
              ],
            },
          ],
        },
        version: 1,
      };

      await db.grids.add(grid);

      const retrievedGrid = await db.grids.get('grid-1');
      expect(retrievedGrid).toEqual(grid);
    });

    it('should retrieve all grids', async () => {
      const grid1: Grid = {
        id: 'grid-1',
        name: 'Grid 1',
        structure: { competencies: [] },
        version: 1,
      };

      const grid2: Grid = {
        id: 'grid-2',
        name: 'Grid 2',
        structure: { competencies: [] },
        version: 1,
      };

      await db.grids.bulkAdd([grid1, grid2]);

      const allGrids = await db.grids.toArray();
      expect(allGrids).toHaveLength(2);
      expect(allGrids.map((g) => g.id)).toContain('grid-1');
      expect(allGrids.map((g) => g.id)).toContain('grid-2');
    });

    it('should update a grid', async () => {
      const grid: Grid = {
        id: 'grid-1',
        name: 'Original Name',
        structure: { competencies: [] },
        version: 1,
      };

      await db.grids.add(grid);

      await db.grids.update('grid-1', { name: 'Updated Name', version: 2 });

      const updatedGrid = await db.grids.get('grid-1');
      expect(updatedGrid?.name).toBe('Updated Name');
      expect(updatedGrid?.version).toBe(2);
    });

    it('should delete a grid', async () => {
      const grid: Grid = {
        id: 'grid-1',
        name: 'Test Grid',
        structure: { competencies: [] },
        version: 1,
      };

      await db.grids.add(grid);
      await db.grids.delete('grid-1');

      const deletedGrid = await db.grids.get('grid-1');
      expect(deletedGrid).toBeUndefined();
    });
  });

  describe('Students Table', () => {
    it('should add a student to the database', async () => {
      const student = {
        id: 'student-1',
        firstName: 'John',
        lastName: 'Doe',
        group: 'Group A',
      };

      await db.students.add(student);

      const retrievedStudent = await db.students.get('student-1');
      expect(retrievedStudent).toEqual(student);
    });

    it('should query students by group', async () => {
      await db.students.bulkAdd([
        { id: 's1', firstName: 'John', lastName: 'Doe', group: 'A' },
        { id: 's2', firstName: 'Jane', lastName: 'Smith', group: 'B' },
        { id: 's3', firstName: 'Bob', lastName: 'Johnson', group: 'A' },
      ]);

      const groupAStudents = await db.students
        .where('group')
        .equals('A')
        .toArray();

      expect(groupAStudents).toHaveLength(2);
      expect(groupAStudents.map((s) => s.id)).toContain('s1');
      expect(groupAStudents.map((s) => s.id)).toContain('s3');
    });
  });

  describe('Exams Table', () => {
    it('should add an exam to the database', async () => {
      const exam = {
        id: 'exam-1',
        date: '2026-01-06',
        label: 'Midterm Exam',
        gridName: 'Test Grid',
        frozenGridStructure: { competencies: [] },
        studentIds: ['s1', 's2'],
        status: 'OPEN' as const,
      };

      await db.exams.add(exam);

      const retrievedExam = await db.exams.get('exam-1');
      expect(retrievedExam).toEqual(exam);
    });
  });

  describe('Grades Table', () => {
    it('should add a grade to the database', async () => {
      const grade = {
        pk: 'exam1+student1+comp1',
        examId: 'exam1',
        studentId: 'student1',
        competencyId: 'comp1',
        status: 'ACQUIS' as const,
        data: JSON.stringify({
          checkedIndicatorIds: ['i1', 'i2'],
          teacherComment: 'Good work',
          timestamp: Date.now(),
        }),
      };

      await db.grades.add(grade);

      const retrievedGrade = await db.grades.get('exam1+student1+comp1');
      expect(retrievedGrade).toEqual(grade);
    });

    it('should query grades by exam', async () => {
      await db.grades.bulkAdd([
        {
          pk: 'exam1+s1+c1',
          examId: 'exam1',
          studentId: 's1',
          competencyId: 'c1',
          status: 'ACQUIS',
          data: '{}',
        },
        {
          pk: 'exam1+s2+c1',
          examId: 'exam1',
          studentId: 's2',
          competencyId: 'c1',
          status: 'NON_ACQUIS',
          data: '{}',
        },
        {
          pk: 'exam2+s1+c1',
          examId: 'exam2',
          studentId: 's1',
          competencyId: 'c1',
          status: 'PENDING',
          data: '{}',
        },
      ]);

      const exam1Grades = await db.grades.where('examId').equals('exam1').toArray();

      expect(exam1Grades).toHaveLength(2);
      expect(exam1Grades.map((g) => g.pk)).toContain('exam1+s1+c1');
      expect(exam1Grades.map((g) => g.pk)).toContain('exam1+s2+c1');
    });
  });
});
