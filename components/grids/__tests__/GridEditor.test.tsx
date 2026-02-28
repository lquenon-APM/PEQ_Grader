import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GridEditor from '../GridEditor';
import { db } from '@/lib/db';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock db
jest.mock('@/lib/db', () => ({
  db: {
    grids: {
      add: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('GridEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with initial empty state', () => {
    render(<GridEditor />);

    expect(screen.getByText('Créer une nouvelle grille')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ex: Soudure CQ6 - Juin 2026')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Libellé du critère (ex: Préparation du poste)')).toBeInTheDocument();
  });

  it('should update grid title', async () => {
    const user = userEvent.setup();
    render(<GridEditor />);

    const titleInput = screen.getByPlaceholderText('ex: Soudure CQ6 - Juin 2026');
    await user.type(titleInput, 'Test Grid');

    expect(titleInput).toHaveValue('Test Grid');
  });

  it('should add a new competency', async () => {
    const user = userEvent.setup();
    render(<GridEditor />);

    const addCompetencyButton = screen.getByText('Nouveau Critère');
    await user.click(addCompetencyButton);

    const competencyInputs = screen.getAllByPlaceholderText('Libellé du critère (ex: Préparation du poste)');
    expect(competencyInputs).toHaveLength(2);
  });

  it('should remove a competency', async () => {
    const user = userEvent.setup();
    render(<GridEditor />);

    // Add a second competency first
    const addCompetencyButton = screen.getByText('Nouveau Critère');
    await user.click(addCompetencyButton);

    // Now remove the first one
    const removeButtons = screen.getAllByTitle('Supprimer le critère');
    await user.click(removeButtons[0]);

    const competencyInputs = screen.getAllByPlaceholderText('Libellé du critère (ex: Préparation du poste)');
    expect(competencyInputs).toHaveLength(1);
  });

  it('should add an indicator to a competency', async () => {
    const user = userEvent.setup();
    render(<GridEditor />);

    const addIndicatorButton = screen.getByText('Ajouter un indicateur');
    await user.click(addIndicatorButton);

    const indicatorInputs = screen.getAllByPlaceholderText("Description de l'indicateur observable");
    expect(indicatorInputs).toHaveLength(2); // Initial 1 + added 1
  });

  it('should toggle indicator critical status', async () => {
    const user = userEvent.setup();
    render(<GridEditor />);

    const criticalButton = screen.getByTitle('Marquer comme critique');
    
    // Initial state: not critical (grayscale classes)
    expect(criticalButton).toHaveClass('grayscale');

    await user.click(criticalButton);
    expect(criticalButton).toHaveClass('text-rose-600'); // Active state

    await user.click(criticalButton);
    expect(criticalButton).toHaveClass('grayscale'); // Back to inactive
  });

  it('should validate required fields before saving', async () => {
    const user = userEvent.setup();

    render(<GridEditor />);

    const saveButton = screen.getByText('Enregistrer la Grille');
    await user.click(saveButton);

    expect(screen.getByText('Le titre de la grille est requis')).toBeInTheDocument();
    expect(db.grids.add).not.toHaveBeenCalled();
  });

  it('should save a valid grid', async () => {
    const user = userEvent.setup();
    const mockAdd = db.grids.add as jest.Mock;
    mockAdd.mockResolvedValue('grid-id');

    render(<GridEditor />);

    // Fill in grid title
    const titleInput = screen.getByPlaceholderText('ex: Soudure CQ6 - Juin 2026');
    await user.type(titleInput, 'Test Grid');

    // Fill in competency label
    const competencyInput = screen.getByPlaceholderText('Libellé du critère (ex: Préparation du poste)');
    await user.type(competencyInput, 'Safety Procedures');

    // Fill in indicator text
    const indicatorInput = screen.getByPlaceholderText("Description de l'indicateur observable");
    await user.type(indicatorInput, 'Wears safety glasses');

    // Save
    const saveButton = screen.getByText('Enregistrer la Grille');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockAdd).toHaveBeenCalled();
    });

    const savedGrid = mockAdd.mock.calls[0][0];
    expect(savedGrid.name).toBe('Test Grid');
    expect(savedGrid.structure.competencies).toHaveLength(1);
    expect(savedGrid.structure.competencies[0].label).toBe('Safety Procedures');
    expect(savedGrid.structure.competencies[0].indicators[0].text).toBe('Wears safety glasses');
  });

  it('should render in edit mode with initial grid data', () => {
    const initialGrid = {
      id: 'grid-1',
      name: 'Existing Grid',
      structure: {
        competencies: [
          {
            id: 'comp-1',
            label: 'Competency 1',
            indicators: [
              { id: 'ind-1', text: 'Indicator 1', critical: true },
            ],
          },
        ],
      },
      version: 1,
    };

    render(<GridEditor initialGrid={initialGrid} />);

    expect(screen.getByText('Modifier la grille')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Grid')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Competency 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Indicator 1')).toBeInTheDocument();
  });
});
