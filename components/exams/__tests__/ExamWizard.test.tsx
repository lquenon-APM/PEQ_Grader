import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExamWizard from "../ExamWizard";
import { db } from "@/lib/db";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock dexie-react-hooks
const mockGrids = [
  {
    id: "grid-1",
    name: "Grid A",
    version: 1,
    structure: {
      competencies: [
        {
          id: "comp-1",
          label: "Competency 1",
          indicators: [
            { id: "ind-1", text: "Indicator 1", critical: true },
            { id: "ind-2", text: "Indicator 2", critical: false },
          ],
        },
        {
          id: "comp-2",
          label: "Competency 2",
          indicators: [{ id: "ind-3", text: "Indicator 3", critical: false }],
        },
      ],
    },
  },
  {
    id: "grid-2",
    name: "Grid B",
    version: 1,
    structure: {
      competencies: [
        {
          id: "comp-3",
          label: "Competency 3",
          indicators: [{ id: "ind-4", text: "Indicator 4", critical: true }],
        },
      ],
    },
  },
];

const mockStudents = [
  { id: "student-1", firstName: "John", lastName: "Doe", group: "A1" },
  { id: "student-2", firstName: "Jane", lastName: "Smith", group: "A1" },
  { id: "student-3", firstName: "Bob", lastName: "Johnson", group: "B2" },
  { id: "student-4", firstName: "Alice", lastName: "Brown", group: "B2" },
];

jest.mock("dexie-react-hooks", () => ({
  useLiveQuery: jest.fn((queryFn) => {
    const query = queryFn.toString();
    if (query.includes("grids")) {
      return mockGrids;
    }
    if (query.includes("students")) {
      return mockStudents;
    }
    return [];
  }),
}));

// Mock the database
jest.mock("@/lib/db", () => ({
  db: {
    grids: {
      toArray: jest.fn(),
      get: jest.fn(),
    },
    students: {
      toArray: jest.fn(),
    },
    exams: {
      add: jest.fn(),
    },
  },
}));

describe("ExamWizard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db.grids.get as jest.Mock).mockImplementation((id) =>
      Promise.resolve(mockGrids.find((g) => g.id === id))
    );
    // Mock crypto.randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: () => 'test-exam-uuid',
      },
      writable: true
    });
  });

  it("renders step 1 initially", () => {
    render(<ExamWizard />);

    expect(screen.getByText("Étape 1 sur 4")).toBeInTheDocument();
    expect(screen.getByText("Sélectionner le protocole d'évaluation")).toBeInTheDocument();
    expect(screen.getByText("Grid A")).toBeInTheDocument();
    expect(screen.getByText("Grid B")).toBeInTheDocument();
  });

  it("shows grid details in step 1", () => {
    render(<ExamWizard />);

    expect(screen.getByText("2 compétences • Version 1")).toBeInTheDocument();
    expect(screen.getByText("1 compétences • Version 1")).toBeInTheDocument();
  });

  it("disables Next button when no grid is selected", () => {
    render(<ExamWizard />);

    const nextButton = screen.getByText("Suivant").closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("enables Next button when a grid is selected", async () => {
    const user = userEvent.setup();
    render(<ExamWizard />);

    const gridCard = screen.getByText("Grid A").closest("div[aria-label]");
    if (gridCard) {
      await user.click(gridCard);
    }

    const nextButton = screen.getByText("Suivant").closest("button");
    expect(nextButton).not.toBeDisabled();
  });

  it("highlights selected grid", async () => {
    const user = userEvent.setup();
    render(<ExamWizard />);

    const gridCard = screen.getByText("Grid A").closest("div[aria-label]");
    if (gridCard) {
      await user.click(gridCard);
    }

    await waitFor(() => {
      // Check if the card has the selected styling
      expect(gridCard).toHaveClass("border-blue-600");
    });
  });

  it("navigates to step 2 when Suivant is clicked", async () => {
    const user = userEvent.setup();
    render(<ExamWizard />);

    const gridCard = screen.getByText("Grid A").closest("div[aria-label]");
    if (gridCard) {
      await user.click(gridCard);
    }

    await user.click(screen.getByText("Suivant"));

    await waitFor(() => {
      expect(screen.getByText("Étape 2 sur 4")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Détails de l'examen" })).toBeInTheDocument();
    });
  });

  describe("Step 2: Exam Metadata", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ExamWizard />);

      // Navigate to step 2
      const gridCard = screen.getByText("Grid A").closest("div[aria-label]");
      if (gridCard) {
        await user.click(gridCard);
      }
      await user.click(screen.getByText("Suivant"));
    });

    it("renders exam metadata form", async () => {
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Détails de l'examen" })).toBeInTheDocument();
        expect(screen.getByLabelText("Date de l'examen")).toBeInTheDocument();
        expect(screen.getByLabelText("Intitulé de l'examen")).toBeInTheDocument();
      });
    });

    it("shows selected grid name", async () => {
      await waitFor(() => {
        expect(screen.getByText("Grille sélectionnée :")).toBeInTheDocument();
        expect(screen.getByText("Grid A")).toBeInTheDocument();
      });
    });

    it("disables Suivant when fields are empty", async () => {
      await waitFor(() => {
        const nextButton = screen.getByText("Suivant").closest("button");
        expect(nextButton).toBeDisabled();
      });
    });

    it("enables Suivant when all fields are filled", async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText("Date de l'examen")).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText("Date de l'examen"), "2024-06-15");
      await user.type(
        screen.getByPlaceholderText("ex: Session de Juin 2026"),
        "Examen de mi-parcours"
      );

      const nextButton = screen.getByText("Suivant").closest("button");
      expect(nextButton).not.toBeDisabled();
    });

    it("allows going back to step 1", async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText("Retour")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Retour"));

      await waitFor(() => {
        expect(screen.getByText("Étape 1 sur 4")).toBeInTheDocument();
        expect(screen.getByText("Sélectionner le protocole d'évaluation")).toBeInTheDocument();
      });
    });
  });

  describe("Step 3: Select Students", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ExamWizard />);

      // Navigate to step 3
      const gridCard = screen.getByText("Grid A").closest("div[aria-label]");
      if (gridCard) {
        await user.click(gridCard);
      }
      await user.click(screen.getByText("Suivant"));

      await waitFor(() => {
        expect(screen.getByLabelText("Date de l'examen")).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText("Date de l'examen"), "2024-06-15");
      await user.type(
        screen.getByPlaceholderText("ex: Session de Juin 2026"),
        "Examen de mi-parcours"
      );
      await user.click(screen.getByText("Suivant"));
    });

    it("renders student selection list", async () => {
      await waitFor(() => {
        expect(screen.getByText("Sélectionner les élèves")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
        expect(screen.getByText("Alice Brown")).toBeInTheDocument();
      });
    });

    it("shows group filter dropdown", async () => {
      await waitFor(() => {
        expect(screen.getByText("Filtrer par groupe :")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Tous les groupes")).toBeInTheDocument();
      });
    });

    it("filters students by group", async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByDisplayValue("Tous les groupes")).toBeInTheDocument();
      });

      const groupFilter = screen.getByDisplayValue("Tous les groupes");
      await user.selectOptions(groupFilter, "A1");

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.queryByText("Bob Johnson")).not.toBeInTheDocument();
        expect(screen.queryByText("Alice Brown")).not.toBeInTheDocument();
      });
    });

    it("selects individual students", async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const johnCheckbox = screen
        .getByText("John Doe")
        .closest("label")
        ?.querySelector('input[type="checkbox"]');

      if (johnCheckbox) {
        await user.click(johnCheckbox);
      }

      await waitFor(() => {
        expect(screen.getByText((content, element) => {
          return element?.tagName.toLowerCase() === 'div' && /1 élève sélectionné/.test(content.replace(/\s+/g, ' '));
        })).toBeInTheDocument();
      });
    });

    it("selects all students", async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText("Tout sélectionner")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Tout sélectionner"));

      await waitFor(() => {
        expect(screen.getByText((content, element) => {
          return element?.tagName.toLowerCase() === 'div' && /4 élèves sélectionnés/.test(content.replace(/\s+/g, ' '));
        })).toBeInTheDocument();
      });
    });

    it("deselects all students", async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText("Tout sélectionner")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Tout sélectionner"));

      await waitFor(() => {
        expect(screen.getByText((content, element) => {
          return element?.tagName.toLowerCase() === 'div' && /4 élèves sélectionnés/.test(content.replace(/\s+/g, ' '));
        })).toBeInTheDocument();
      });

      await user.click(screen.getByText("Tout désélectionner"));

      await waitFor(() => {
        expect(screen.getByText((content, element) => {
          return element?.tagName.toLowerCase() === 'div' && /0 élèves? sélectionnés?/.test(content.replace(/\s+/g, ' '));
        })).toBeInTheDocument();
      });
    });

    it("disables Suivant when no students selected", async () => {
      await waitFor(() => {
        const nextButton = screen.getByText("Suivant").closest("button");
        expect(nextButton).toBeDisabled();
      });
    });

    it("enables Suivant when at least one student is selected", async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const johnCheckbox = screen
        .getByText("John Doe")
        .closest("label")
        ?.querySelector('input[type="checkbox"]');

      if (johnCheckbox) {
        await user.click(johnCheckbox);
      }

      const nextButton = screen.getByText("Suivant").closest("button");
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe("Step 4: Review & Confirm", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ExamWizard />);

      // Navigate to step 4
      const gridCard = screen.getByText("Grid A").closest("div[aria-label]");
      if (gridCard) {
        await user.click(gridCard);
      }
      await user.click(screen.getByText("Suivant"));

      await waitFor(() => {
        expect(screen.getByLabelText("Date de l'examen")).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText("Date de l'examen"), "2024-06-15");
      await user.type(
        screen.getByPlaceholderText("ex: Session de Juin 2026"),
        "Examen de mi-parcours"
      );
      await user.click(screen.getByText("Suivant"));

      await waitFor(() => {
        expect(screen.getByText("Tout sélectionner")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Tout sélectionner"));
      await user.click(screen.getByText("Suivant"));
    });

    it("renders review summary", async () => {
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Récapitulatif & Confirmation" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Protocole d'évaluation" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Détails de l'examen" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Élèves" })).toBeInTheDocument();
      });
    });

    it("shows selected grid information", async () => {
      await waitFor(() => {
        expect(screen.getByText("Grid A")).toBeInTheDocument();
        expect(screen.getByText(/2 compétences/)).toBeInTheDocument();
      });
    });

    it("shows exam details", async () => {
      await waitFor(() => {
        expect(screen.getByText(/15 juin 2024/)).toBeInTheDocument();
        expect(screen.getByText(/Examen de mi-parcours/)).toBeInTheDocument();
      });
    });

    it("shows selected students grouped by group", async () => {
      await waitFor(() => {
        expect(screen.getByText((content, element) => {
          return element?.tagName.toLowerCase() === 'p' && /4 élèves sélectionnés/.test(content.replace(/\s+/g, ' '));
        })).toBeInTheDocument();
        expect(screen.getByText("Groupe A1 :")).toBeInTheDocument();
        expect(screen.getByText("Groupe B2 :")).toBeInTheDocument();
      });
    });

    it("shows Créer l'examen button instead of Suivant", async () => {
      await waitFor(() => {
        expect(screen.getByText("Créer l'examen")).toBeInTheDocument();
        expect(screen.queryByText("Suivant")).not.toBeInTheDocument();
      });
    });

    it("creates exam with frozen grid structure", async () => {
      const user = userEvent.setup();
      (db.exams.add as jest.Mock).mockResolvedValue("exam-id");

      await waitFor(() => {
        expect(screen.getByText("Créer l'examen")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Créer l'examen"));

      await waitFor(() => {
        expect(db.exams.add).toHaveBeenCalledWith(
          expect.objectContaining({
            id: expect.any(String),
            date: "2024-06-15",
            label: "Examen de mi-parcours",
            gridName: "Grid A",
            frozenGridStructure: expect.objectContaining({
              competencies: expect.arrayContaining([
                expect.objectContaining({
                  id: "comp-1",
                  label: "Competency 1",
                }),
              ]),
            }),
            studentIds: expect.arrayContaining([
              "student-1",
              "student-2",
              "student-3",
              "student-4",
            ]),
          })
        );
      });
    });

    it("redirects to dashboard after creating exam", async () => {
      const user = userEvent.setup();
      (db.exams.add as jest.Mock).mockResolvedValue("exam-id");

      await waitFor(() => {
        expect(screen.getByText("Créer l'examen")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Créer l'examen"));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("Progress indicator", () => {
    it("updates progress bar as steps advance", async () => {
      const user = userEvent.setup();
      render(<ExamWizard />);

      // Step 1: 25%
      const progressBar = document.querySelector(
        ".bg-blue-600"
      ) as HTMLElement;
      expect(progressBar).toHaveStyle("width: 25%");

      // Navigate to step 2
      const gridCard = screen.getByText("Grid A").closest("div[aria-label]");
      if (gridCard) {
        await user.click(gridCard);
      }
      await user.click(screen.getByText("Suivant"));

      await waitFor(() => {
        expect(progressBar).toHaveStyle("width: 50%");
      });

      // Navigate to step 3
      await user.type(screen.getByLabelText("Date de l'examen"), "2024-06-15");
      await user.type(
        screen.getByPlaceholderText("ex: Session de Juin 2026"),
        "Examen"
      );
      await user.click(screen.getByText("Suivant"));

      await waitFor(() => {
        expect(progressBar).toHaveStyle("width: 75%");
      });

      // Navigate to step 4
      await user.click(screen.getByText("Tout sélectionner"));
      await user.click(screen.getByText("Suivant"));

      await waitFor(() => {
        expect(progressBar).toHaveStyle("width: 100%");
      });
    });
  });

  describe("Back button", () => {
    it("disables Retour button on step 1", () => {
      render(<ExamWizard />);

      const backButton = screen.getByText("Retour").closest("button");
      expect(backButton).toBeDisabled();
    });

    it("preserves data when going back", async () => {
      const user = userEvent.setup();
      render(<ExamWizard />);

      // Select grid
      const gridCard = screen.getByText("Grid A").closest("div[aria-label]");
      if (gridCard) {
        await user.click(gridCard);
      }
      await user.click(screen.getByText("Suivant"));

      // Fill exam details
      await waitFor(() => {
        expect(screen.getByLabelText("Date de l'examen")).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText("Date de l'examen"), "2024-06-15");
      await user.type(
        screen.getByPlaceholderText("ex: Session de Juin 2026"),
        "Examen"
      );

      // Go back
      await user.click(screen.getByText("Retour"));

      await waitFor(() => {
        expect(screen.getByText("Étape 1 sur 4")).toBeInTheDocument();
      });

      // Go forward again
      await user.click(screen.getByText("Suivant"));

      await waitFor(() => {
        expect(screen.getByLabelText("Date de l'examen")).toHaveValue("2024-06-15");
        expect(
          screen.getByPlaceholderText("ex: Session de Juin 2026")
        ).toHaveValue("Examen");
      });
    });
  });
});
