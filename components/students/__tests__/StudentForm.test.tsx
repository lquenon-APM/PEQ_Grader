import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentForm from '../StudentForm';
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
    students: {
      add: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('StudentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock crypto.randomUUID for testing
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: () => 'test-uuid',
      },
    });
  });

  describe('Create Mode', () => {
    it('renders the form with empty fields', () => {
      render(<StudentForm />);

      expect(screen.getByText('Ajouter un nouvel élève')).toBeInTheDocument();
      expect(screen.getByLabelText('Prénom')).toHaveValue('');
      expect(screen.getByLabelText('Nom')).toHaveValue('');
      expect(screen.getByLabelText('Groupe')).toHaveValue('');
      expect(screen.getByLabelText('Date de naissance')).toHaveValue('');
    });

    it('updates form fields when user types', async () => {
      const user = userEvent.setup();
      render(<StudentForm />);

      await user.type(screen.getByLabelText('Prénom'), 'Jean');
      await user.type(screen.getByLabelText('Nom'), 'Dupont');
      await user.type(screen.getByLabelText('Groupe'), '6MA');

      expect(screen.getByLabelText('Prénom')).toHaveValue('Jean');
      expect(screen.getByLabelText('Nom')).toHaveValue('Dupont');
      expect(screen.getByLabelText('Groupe')).toHaveValue('6MA');
    });

    it('validates that first name is required', async () => {
      const user = userEvent.setup();
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<StudentForm />);

      const saveButton = screen.getByText("Enregistrer l'élève");
      await user.click(saveButton);

      expect(alertMock).toHaveBeenCalledWith('Le prénom est requis');
      expect(db.students.add).not.toHaveBeenCalled();

      alertMock.mockRestore();
    });

    it('validates that last name is required', async () => {
      const user = userEvent.setup();
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<StudentForm />);

      await user.type(screen.getByLabelText('Prénom'), 'Jean');
      const saveButton = screen.getByText("Enregistrer l'élève");
      await user.click(saveButton);

      expect(alertMock).toHaveBeenCalledWith('Le nom est requis');
      expect(db.students.add).not.toHaveBeenCalled();

      alertMock.mockRestore();
    });

    it('validates that group is required', async () => {
      const user = userEvent.setup();
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<StudentForm />);

      await user.type(screen.getByLabelText('Prénom'), 'Jean');
      await user.type(screen.getByLabelText('Nom'), 'Dupont');
      const saveButton = screen.getByText("Enregistrer l'élève");
      await user.click(saveButton);

      expect(alertMock).toHaveBeenCalledWith('Le groupe est requis');
      expect(db.students.add).not.toHaveBeenCalled();

      alertMock.mockRestore();
    });

    it('saves a new student successfully', async () => {
      const user = userEvent.setup();
      const mockAdd = db.students.add as jest.Mock;
      mockAdd.mockResolvedValue('new-id');

      render(<StudentForm />);

      await user.type(screen.getByLabelText('Prénom'), 'Jean');
      await user.type(screen.getByLabelText('Nom'), 'Dupont');
      await user.type(screen.getByLabelText('Groupe'), '6MA');
      await user.type(screen.getByLabelText('Date de naissance'), '2008-05-15');

      const saveButton = screen.getByText("Enregistrer l'élève");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockAdd).toHaveBeenCalledWith({
          id: 'test-uuid',
          firstName: 'Jean',
          lastName: 'Dupont',
          group: '6MA',
          birthDate: '2008-05-15',
        });
      });
    });
  });

  describe('Edit Mode', () => {
    const initialStudent = {
      id: 'student-1',
      firstName: 'Alice',
      lastName: 'Smith',
      group: 'A1',
      birthDate: '2010-01-01',
    };

    it('renders the form with initial student data', () => {
      render(<StudentForm initialStudent={initialStudent} />);

      expect(screen.getByText("Modifier l'élève")).toBeInTheDocument();
      expect(screen.getByLabelText('Prénom')).toHaveValue('Alice');
      expect(screen.getByLabelText('Nom')).toHaveValue('Smith');
      expect(screen.getByLabelText('Groupe')).toHaveValue('A1');
      expect(screen.getByLabelText('Date de naissance')).toHaveValue('2010-01-01');
    });

    it('updates an existing student successfully', async () => {
      const user = userEvent.setup();
      const mockUpdate = db.students.update as jest.Mock;
      mockUpdate.mockResolvedValue(1);

      render(<StudentForm initialStudent={initialStudent} />);

      await user.clear(screen.getByLabelText('Prénom'));
      await user.type(screen.getByLabelText('Prénom'), 'Bob');

      const updateButton = screen.getByText('Mettre à jour');
      await user.click(updateButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith('student-1', {
          firstName: 'Bob',
          lastName: 'Smith',
          group: 'A1',
          birthDate: '2010-01-01',
        });
      });
    });
  });
});
