import { calculateSuggestedStatus, SUCCESS_THRESHOLD } from "../logic";

describe("calculateSuggestedStatus (Story 6 - Remediation Logic)", () => {
  const indicators = [
    { id: "1", text: "Crit 1", critical: true },
    { id: "2", text: "Crit 2", critical: true },
    { id: "3", text: "Std 1", critical: false },
    { id: "4", text: "Std 2", critical: false },
    { id: "5", text: "Std 3", critical: false },
    { id: "6", text: "Std 4", critical: false },
  ];

  it("should return PENDING if no indicators are provided", () => {
    expect(calculateSuggestedStatus([], [])).toBe("PENDING");
  });

  it("should return NON_ACQUIS if any critical indicator is missing", () => {
    // Missing critical #2
    expect(calculateSuggestedStatus(["1", "3", "4", "5", "6"], indicators)).toBe("NON_ACQUIS");
  });

  describe("Remediation Seuil (75%)", () => {
    it("should return REMEDIATION if all criticals are checked but standards are below threshold (e.g., 50%)", () => {
      // Checked: 2 criticals, 2 out of 4 standards (50% < 75%)
      expect(calculateSuggestedStatus(["1", "2", "3", "4"], indicators)).toBe("REMEDIATION");
    });

    it("should return ACQUIS if all criticals are checked and standards are exactly at threshold (75%)", () => {
      // Checked: 2 criticals, 3 out of 4 standards (75% >= 75%)
      expect(calculateSuggestedStatus(["1", "2", "3", "4", "5"], indicators)).toBe("ACQUIS");
    });

    it("should return ACQUIS if all criticals and all standards are checked (100%)", () => {
      expect(calculateSuggestedStatus(["1", "2", "3", "4", "5", "6"], indicators)).toBe("ACQUIS");
    });
  });

  it("should return ACQUIS if only critical indicators exist and all are checked", () => {
    const onlyCriticals = [
      { id: "1", text: "Crit 1", critical: true },
      { id: "2", text: "Crit 2", critical: true },
    ];
    expect(calculateSuggestedStatus(["1", "2"], onlyCriticals)).toBe("ACQUIS");
  });

  it("should return REMEDIATION if only standard indicators exist and are below threshold", () => {
    const onlyStandards = [
      { id: "1", text: "Std 1", critical: false },
      { id: "2", text: "Std 2", critical: false },
    ];
    // 50% success ratio
    expect(calculateSuggestedStatus(["1"], onlyStandards)).toBe("REMEDIATION");
  });
});
