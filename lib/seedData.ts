import { db, type Grid, type Student, type Exam } from "./db";

/**
 * Script de peuplement de la base de données avec des données de test
 * Utile pour le développement et les tests manuels
 */

// Données de test pour les grilles d'évaluation
const sampleGrids: Omit<Grid, "id">[] = [
  {
    name: "Grille Soudage - Niveau 1",
    version: 1,
    structure: {
      competencies: [
        {
          id: crypto.randomUUID(),
          label: "Préparation du poste de travail",
          indicators: [
            {
              id: crypto.randomUUID(),
              text: "Vérifie l'état du matériel avant utilisation",
              critical: true,
            },
            {
              id: crypto.randomUUID(),
              text: "Porte les équipements de protection individuelle",
              critical: true,
            },
            {
              id: crypto.randomUUID(),
              text: "Organise l'espace de travail de manière ergonomique",
              critical: false,
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          label: "Réalisation de la soudure",
          indicators: [
            {
              id: crypto.randomUUID(),
              text: "Sélectionne le type de soudure approprié",
              critical: true,
            },
            {
              id: crypto.randomUUID(),
              text: "Maintient un angle et une vitesse constants",
              critical: false,
            },
            {
              id: crypto.randomUUID(),
              text: "Produit une soudure sans défauts majeurs",
              critical: true,
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          label: "Contrôle qualité",
          indicators: [
            {
              id: crypto.randomUUID(),
              text: "Inspecte visuellement la soudure",
              critical: false,
            },
            {
              id: crypto.randomUUID(),
              text: "Identifie et corrige les défauts",
              critical: true,
            },
          ],
        },
      ],
    },
  },
  {
    name: "Grille Électricité - Niveau 2",
    version: 1,
    structure: {
      competencies: [
        {
          id: crypto.randomUUID(),
          label: "Sécurité électrique",
          indicators: [
            {
              id: crypto.randomUUID(),
              text: "Coupe le courant avant toute intervention",
              critical: true,
            },
            {
              id: crypto.randomUUID(),
              text: "Utilise un testeur de tension",
              critical: true,
            },
            {
              id: crypto.randomUUID(),
              text: "Respecte les codes de couleur des fils",
              critical: true,
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          label: "Installation",
          indicators: [
            {
              id: crypto.randomUUID(),
              text: "Réalise le schéma électrique",
              critical: false,
            },
            {
              id: crypto.randomUUID(),
              text: "Effectue les connexions correctement",
              critical: true,
            },
            {
              id: crypto.randomUUID(),
              text: "Vérifie le bon fonctionnement de l'installation",
              critical: true,
            },
          ],
        },
      ],
    },
  },
  {
    name: "Grille Mécanique Auto - Diagnostic",
    version: 1,
    structure: {
      competencies: [
        {
          id: crypto.randomUUID(),
          label: "Diagnostic initial",
          indicators: [
            {
              id: crypto.randomUUID(),
              text: "Interroge le client sur les symptômes",
              critical: false,
            },
            {
              id: crypto.randomUUID(),
              text: "Effectue un diagnostic visuel",
              critical: false,
            },
            {
              id: crypto.randomUUID(),
              text: "Utilise l'outil de diagnostic électronique",
              critical: true,
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          label: "Réparation",
          indicators: [
            {
              id: crypto.randomUUID(),
              text: "Identifie la pièce défectueuse",
              critical: true,
            },
            {
              id: crypto.randomUUID(),
              text: "Remplace la pièce en respectant les procédures",
              critical: true,
            },
            {
              id: crypto.randomUUID(),
              text: "Teste le bon fonctionnement après réparation",
              critical: true,
            },
          ],
        },
      ],
    },
  },
];

// Données de test pour les étudiants
const sampleStudents: Omit<Student, "id">[] = [
  { firstName: "Emma", lastName: "Martin", group: "A1" },
  { firstName: "Lucas", lastName: "Bernard", group: "A1" },
  { firstName: "Léa", lastName: "Dubois", group: "A1" },
  { firstName: "Noah", lastName: "Thomas", group: "A1" },
  { firstName: "Chloé", lastName: "Robert", group: "A1" },
  { firstName: "Louis", lastName: "Petit", group: "B2" },
  { firstName: "Camille", lastName: "Richard", group: "B2" },
  { firstName: "Gabriel", lastName: "Durand", group: "B2" },
  { firstName: "Sarah", lastName: "Leroy", group: "B2" },
  { firstName: "Arthur", lastName: "Moreau", group: "B2" },
  { firstName: "Alice", lastName: "Simon", group: "C3" },
  { firstName: "Jules", lastName: "Laurent", group: "C3" },
  { firstName: "Inès", lastName: "Lefebvre", group: "C3" },
  { firstName: "Tom", lastName: "Michel", group: "C3" },
  { firstName: "Manon", lastName: "Garcia", group: "C3" },
];

/**
 * Peuple la base de données avec des grilles de test
 */
export async function seedGrids(): Promise<string[]> {
  console.log("🌱 Seeding grids...");

  const gridIds: string[] = [];

  for (const gridData of sampleGrids) {
    const id = crypto.randomUUID();
    await db.grids.add({
      id,
      ...gridData,
    });
    gridIds.push(id);
    console.log(`✅ Grid created: ${gridData.name} (${id})`);
  }

  console.log(`✅ ${gridIds.length} grids created`);
  return gridIds;
}

/**
 * Peuple la base de données avec des étudiants de test
 */
export async function seedStudents(): Promise<string[]> {
  console.log("🌱 Seeding students...");

  const studentIds: string[] = [];

  for (const studentData of sampleStudents) {
    const id = crypto.randomUUID();
    await db.students.add({
      id,
      ...studentData,
    });
    studentIds.push(id);
  }

  console.log(
    `✅ ${studentIds.length} students created across ${
      new Set(sampleStudents.map((s) => s.group)).size
    } groups`
  );
  return studentIds;
}

/**
 * Peuple la base de données avec des examens de test
 */
export async function seedExams(
  gridIds?: string[],
  studentIds?: string[]
): Promise<string[]> {
  console.log("🌱 Seeding exams...");

  // Si pas d'IDs fournis, récupérer les existants
  if (!gridIds || gridIds.length === 0) {
    const grids = await db.grids.toArray();
    gridIds = grids.map((g) => g.id);
  }

  if (!studentIds || studentIds.length === 0) {
    const students = await db.students.toArray();
    studentIds = students.map((s) => s.id);
  }

  if (gridIds.length === 0 || studentIds.length === 0) {
    console.warn("⚠️ No grids or students found. Skipping exam seeding.");
    return [];
  }

  const examIds: string[] = [];

  // Examen 1: Premier groupe avec première grille
  const grid1 = await db.grids.get(gridIds[0]);
  if (grid1) {
    const students = await db.students.toArray();
    const groupA1Students = students
      .filter((s) => s.group === "A1")
      .map((s) => s.id);

    if (groupA1Students.length > 0) {
      const examId1 = crypto.randomUUID();
      await db.exams.add({
        id: examId1,
        date: "2024-06-15",
        label: "Examen Pratique Soudage - Juin 2024",
        gridName: grid1.name,
        frozenGridStructure: structuredClone(grid1.structure),
        studentIds: groupA1Students,
        status: "CLOSED",
      });
      examIds.push(examId1);
      console.log(
        `✅ Exam created: Soudage Group A1 (${groupA1Students.length} students)`
      );
    }
  }

  // Examen 2: Deuxième groupe avec deuxième grille
  if (gridIds.length > 1) {
    const grid2 = await db.grids.get(gridIds[1]);
    if (grid2) {
      const students = await db.students.toArray();
      const groupB2Students = students
        .filter((s) => s.group === "B2")
        .map((s) => s.id);

      if (groupB2Students.length > 0) {
        const examId2 = crypto.randomUUID();
        await db.exams.add({
          id: examId2,
          date: "2024-06-20",
          label: "Évaluation Électricité - Session Été",
          gridName: grid2.name,
          frozenGridStructure: structuredClone(grid2.structure),
          studentIds: groupB2Students,
          status: "OPEN",
        });
        examIds.push(examId2);
        console.log(
          `✅ Exam created: Électricité Group B2 (${groupB2Students.length} students)`
        );
      }
    }
  }

  // Examen 3: Tous les groupes avec troisième grille
  if (gridIds.length > 2) {
    const grid3 = await db.grids.get(gridIds[2]);
    if (grid3) {
      const examId3 = crypto.randomUUID();
      await db.exams.add({
        id: examId3,
        date: "2024-07-05",
        label: "Examen Final Mécanique",
        gridName: grid3.name,
        frozenGridStructure: structuredClone(grid3.structure),
        studentIds: studentIds.slice(0, Math.min(10, studentIds.length)),
        status: "OPEN",
      });
      examIds.push(examId3);
      console.log(`✅ Exam created: Mécanique Multi-groupes`);
    }
  }

  console.log(`✅ ${examIds.length} exams created`);
  return examIds;
}

/**
 * Vide complètement la base de données
 */
export async function clearDatabase(): Promise<void> {
  console.log("🗑️ Clearing database...");

  await db.grades.clear();
  console.log("✅ Grades cleared");

  await db.exams.clear();
  console.log("✅ Exams cleared");

  await db.students.clear();
  console.log("✅ Students cleared");

  await db.grids.clear();
  console.log("✅ Grids cleared");

  console.log("✅ Database cleared successfully");
}

/**
 * Peuple complètement la base de données avec toutes les données de test
 */
export async function seedAll(): Promise<void> {
  console.log("🌱 Starting full database seed...");

  try {
    await clearDatabase();

    const gridIds = await seedGrids();
    const studentIds = await seedStudents();
    await seedExams(gridIds, studentIds);

    console.log("✅ Database seeded successfully!");
    console.log("📊 Summary:");
    console.log(`   - ${gridIds.length} grids`);
    console.log(`   - ${studentIds.length} students`);
    console.log(`   - Exams created for multiple groups`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

/**
 * Affiche les statistiques de la base de données
 */
export async function getDatabaseStats(): Promise<void> {
  const gridsCount = await db.grids.count();
  const studentsCount = await db.students.count();
  const examsCount = await db.exams.count();
  const gradesCount = await db.grades.count();

  console.log("📊 Database Statistics:");
  console.log(`   - Grids: ${gridsCount}`);
  console.log(`   - Students: ${studentsCount}`);
  console.log(`   - Exams: ${examsCount}`);
  console.log(`   - Grades: ${gradesCount}`);

  if (studentsCount > 0) {
    const students = await db.students.toArray();
    const groups = new Set(students.map((s) => s.group));
    console.log(`   - Student groups: ${Array.from(groups).join(", ")}`);
  }
}

// Exporter pour utilisation dans la console du navigateur
if (typeof window !== "undefined") {
  (window as any).seedDatabase = {
    seedAll,
    seedGrids,
    seedStudents,
    seedExams,
    clearDatabase,
    stats: getDatabaseStats,
  };
  console.log("💡 Seed functions available in console:");
  console.log("   - seedDatabase.seedAll() - Populate everything");
  console.log("   - seedDatabase.seedGrids() - Add sample grids");
  console.log("   - seedDatabase.seedStudents() - Add sample students");
  console.log("   - seedDatabase.seedExams() - Add sample exams");
  console.log("   - seedDatabase.clearDatabase() - Clear all data");
  console.log("   - seedDatabase.stats() - Show database statistics");
}
