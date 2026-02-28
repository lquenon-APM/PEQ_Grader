import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CSVImporter from "../CSVImporter";
import { db } from "@/lib/db";

// Mock the database
jest.mock("@/lib/db", () => ({
  db: {
    students: {
      bulkAdd: jest.fn(),
    },
  },
}));

describe("CSVImporter", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the upload state initially", () => {
    render(<CSVImporter onClose={mockOnClose} />);
    
    expect(screen.getByText("Upload CSV File")).toBeInTheDocument();
    expect(screen.getByText("Choose File")).toBeInTheDocument();
  });

  it("parses a valid CSV file and shows preview", async () => {
    render(<CSVImporter onClose={mockOnClose} />);
    
    const file = new File(
      ["John,Doe,A1\nJane,Smith,B2"],
      "students.csv",
      { type: "text/csv" }
    );
    
    const input = screen.getByLabelText(/choose file/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("2 Valid")).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Jane")).toBeInTheDocument();
      expect(screen.getByText("A1")).toBeInTheDocument();
      expect(screen.getByText("B2")).toBeInTheDocument();
    });
  });

  it("identifies invalid lines in CSV", async () => {
    render(<CSVImporter onClose={mockOnClose} />);
    
    // Line 2 is missing group
    const file = new File(
      ["John,Doe,A1\nJane,Smith"],
      "students.csv",
      { type: "text/csv" }
    );
    
    const input = screen.getByLabelText(/choose file/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("1 Valid")).toBeInTheDocument();
      expect(screen.getByText("1 Invalid")).toBeInTheDocument();
    });
  });

  it("imports valid students successfully", async () => {
    const user = userEvent.setup();
    (db.students.bulkAdd as jest.Mock).mockResolvedValue(undefined);
    const alertMock = jest.spyOn(window, "alert").mockImplementation();

    render(<CSVImporter onClose={mockOnClose} />);
    
    const file = new File(
      ["John,Doe,A1"],
      "students.csv",
      { type: "text/csv" }
    );
    
    const input = screen.getByLabelText(/choose file/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => screen.getByText("Import 1 Student"));
    
    await user.click(screen.getByText("Import 1 Student"));

    await waitFor(() => {
      expect(db.students.bulkAdd).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            firstName: "John",
            lastName: "Doe",
            group: "A1",
          })
        ])
      );
      expect(alertMock).toHaveBeenCalledWith("Successfully imported 1 student(s)");
      expect(mockOnClose).toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });

  it("handles import errors gracefully", async () => {
    const user = userEvent.setup();
    (db.students.bulkAdd as jest.Mock).mockRejectedValue(new Error("DB Error"));
    const alertMock = jest.spyOn(window, "alert").mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    render(<CSVImporter onClose={mockOnClose} />);
    
    const file = new File(
      ["John,Doe,A1"],
      "students.csv",
      { type: "text/csv" }
    );
    
    const input = screen.getByLabelText(/choose file/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => screen.getByText("Import 1 Student"));
    await user.click(screen.getByText("Import 1 Student"));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Failed to import students. Please try again.");
    });

    alertMock.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});