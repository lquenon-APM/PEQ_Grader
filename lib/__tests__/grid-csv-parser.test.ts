import { parseGridCSV } from "../grid-csv-parser";

// Mock crypto.randomUUID for deterministic tests
let uuidCounter = 0;
beforeEach(() => {
  uuidCounter = 0;
  jest.spyOn(crypto, "randomUUID").mockImplementation(() => {
    uuidCounter++;
    return `uuid-${uuidCounter}`;
  });
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe("parseGridCSV", () => {
  describe("Séparateur auto-détecté", () => {
    it("parse un CSV valide avec séparateur `;`", () => {
      const csv = "Comp A;Indicateur 1;true\nComp A;Indicateur 2;false";
      const result = parseGridCSV(csv);

      expect(result.validLineCount).toBe(2);
      expect(result.invalidLineCount).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.gridStructure.competencies).toHaveLength(1);
      expect(result.gridStructure.competencies[0].label).toBe("Comp A");
      expect(result.gridStructure.competencies[0].indicators).toHaveLength(2);
      expect(result.gridStructure.competencies[0].indicators[0]).toEqual({
        id: "uuid-2",
        text: "Indicateur 1",
        critical: true,
      });
      expect(result.gridStructure.competencies[0].indicators[1]).toEqual({
        id: "uuid-3",
        text: "Indicateur 2",
        critical: false,
      });
    });

    it("parse un CSV valide avec séparateur `,`", () => {
      const csv = "Comp B,Indicateur X,oui\nComp B,Indicateur Y,non";
      const result = parseGridCSV(csv);

      expect(result.validLineCount).toBe(2);
      expect(result.invalidLineCount).toBe(0);
      expect(result.gridStructure.competencies).toHaveLength(1);
      expect(result.gridStructure.competencies[0].label).toBe("Comp B");
      expect(result.gridStructure.competencies[0].indicators[0].critical).toBe(true);
      expect(result.gridStructure.competencies[0].indicators[1].critical).toBe(false);
    });
  });

  describe("Détection de la ligne d'en-tête", () => {
    it("détecte et ignore une ligne d'en-tête anglaise", () => {
      const csv = "Competency;Indicator;Critical\nComp A;Ind 1;true";
      const result = parseGridCSV(csv);

      expect(result.validLineCount).toBe(1);
      expect(result.gridStructure.competencies).toHaveLength(1);
      expect(result.gridStructure.competencies[0].label).toBe("Comp A");
    });

    it("détecte et ignore une ligne d'en-tête française", () => {
      const csv = "Compétence;Indicateur;Critique\nComp A;Ind 1;false";
      const result = parseGridCSV(csv);

      expect(result.validLineCount).toBe(1);
      expect(result.gridStructure.competencies[0].label).toBe("Comp A");
    });

    it("ne traite pas une ligne de données comme un en-tête", () => {
      const csv = "Math;Addition;true";
      const result = parseGridCSV(csv);

      expect(result.validLineCount).toBe(1);
      expect(result.gridStructure.competencies[0].label).toBe("Math");
    });
  });

  describe("Regroupement des compétences", () => {
    it("regroupe les lignes avec le même nom de compétence", () => {
      const csv = [
        "Français;Lecture;true",
        "Math;Addition;false",
        "Français;Écriture;false",
        "Math;Soustraction;true",
      ].join("\n");

      const result = parseGridCSV(csv);

      expect(result.validLineCount).toBe(4);
      expect(result.gridStructure.competencies).toHaveLength(2);

      const francais = result.gridStructure.competencies[0];
      expect(francais.label).toBe("Français");
      expect(francais.indicators).toHaveLength(2);
      expect(francais.indicators[0].text).toBe("Lecture");
      expect(francais.indicators[1].text).toBe("Écriture");

      const math = result.gridStructure.competencies[1];
      expect(math.label).toBe("Math");
      expect(math.indicators).toHaveLength(2);
    });

    it("préserve l'ordre d'insertion des compétences", () => {
      const csv = "Z Comp;Ind 1;false\nA Comp;Ind 2;false\nZ Comp;Ind 3;false";
      const result = parseGridCSV(csv);

      expect(result.gridStructure.competencies[0].label).toBe("Z Comp");
      expect(result.gridStructure.competencies[1].label).toBe("A Comp");
    });
  });

  describe("Parsing du flag critical", () => {
    const cases: [string, boolean][] = [
      ["true", true],
      ["TRUE", true],
      ["True", true],
      ["false", false],
      ["FALSE", false],
      ["1", true],
      ["0", false],
      ["oui", true],
      ["OUI", true],
      ["non", false],
      ["NON", false],
      ["yes", true],
      ["YES", true],
      ["no", false],
      ["NO", false],
    ];

    it.each(cases)("interprète '%s' comme %s", (value, expected) => {
      const csv = `Comp;Ind;${value}`;
      const result = parseGridCSV(csv);
      expect(result.gridStructure.competencies[0].indicators[0].critical).toBe(expected);
    });

    it("défaut à false si le champ critical est vide", () => {
      const csv = "Comp;Ind;";
      const result = parseGridCSV(csv);
      expect(result.gridStructure.competencies[0].indicators[0].critical).toBe(false);
    });

    it("défaut à false si le champ critical est absent", () => {
      const csv = "Comp;Ind";
      const result = parseGridCSV(csv);
      expect(result.gridStructure.competencies[0].indicators[0].critical).toBe(false);
    });
  });

  describe("Validation par ligne", () => {
    it("produit une erreur si le nom de compétence est vide", () => {
      const csv = ";Indicateur 1;true";
      const result = parseGridCSV(csv);

      expect(result.invalidLineCount).toBe(1);
      expect(result.validLineCount).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].lineNumber).toBe(1);
      expect(result.errors[0].message).toContain("compétence");
    });

    it("produit une erreur si le texte de l'indicateur est vide", () => {
      const csv = "Comp A;;true";
      const result = parseGridCSV(csv);

      expect(result.invalidLineCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain("indicateur");
    });

    it("produit deux erreurs si compétence ET indicateur sont vides", () => {
      const csv = ";;true";
      const result = parseGridCSV(csv);

      expect(result.invalidLineCount).toBe(1);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe("Lignes mixtes valides/invalides", () => {
    it("retourne les bons compteurs et une structure partielle", () => {
      const csv = [
        "Comp A;Ind 1;true",
        ";Ind orphelin;false",
        "Comp B;;true",
        "Comp A;Ind 2;false",
      ].join("\n");

      const result = parseGridCSV(csv);

      expect(result.validLineCount).toBe(2);
      expect(result.invalidLineCount).toBe(2);
      expect(result.errors).toHaveLength(2);
      expect(result.gridStructure.competencies).toHaveLength(1);
      expect(result.gridStructure.competencies[0].indicators).toHaveLength(2);
    });
  });

  describe("Entrée vide", () => {
    it("retourne une structure vide sans erreurs pour un input vide", () => {
      const result = parseGridCSV("");

      expect(result.gridStructure.competencies).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(result.validLineCount).toBe(0);
      expect(result.invalidLineCount).toBe(0);
    });

    it("retourne une structure vide pour un input avec seulement des lignes vides", () => {
      const result = parseGridCSV("\n\n  \n");

      expect(result.gridStructure.competencies).toHaveLength(0);
      expect(result.validLineCount).toBe(0);
    });
  });

  describe("Cas limites", () => {
    it("gère les fins de ligne Windows (\\r\\n)", () => {
      const csv = "Comp A;Ind 1;true\r\nComp A;Ind 2;false";
      const result = parseGridCSV(csv);

      expect(result.validLineCount).toBe(2);
      expect(result.gridStructure.competencies[0].indicators).toHaveLength(2);
    });

    it("gère les caractères Unicode et accents français", () => {
      const csv = "Compétence élémentaire;Résolution de problèmes;oui";
      const result = parseGridCSV(csv);

      expect(result.validLineCount).toBe(1);
      expect(result.gridStructure.competencies[0].label).toBe("Compétence élémentaire");
      expect(result.gridStructure.competencies[0].indicators[0].text).toBe("Résolution de problèmes");
    });

    it("ignore les lignes vides en fin de fichier", () => {
      const csv = "Comp;Ind;true\n\n\n";
      const result = parseGridCSV(csv);

      expect(result.validLineCount).toBe(1);
      expect(result.invalidLineCount).toBe(0);
    });

    it("respecte le séparateur explicitement fourni via options", () => {
      const csv = "Comp A,has;semicolons,true";
      const result = parseGridCSV(csv, { separator: "," });

      expect(result.gridStructure.competencies[0].label).toBe("Comp A");
      expect(result.gridStructure.competencies[0].indicators[0].text).toBe("has;semicolons");
    });

    it("génère des UUIDs uniques pour chaque compétence et indicateur", () => {
      const csv = "Comp A;Ind 1;true\nComp B;Ind 2;false";
      const result = parseGridCSV(csv);

      const ids = [
        result.gridStructure.competencies[0].id,
        result.gridStructure.competencies[0].indicators[0].id,
        result.gridStructure.competencies[1].id,
        result.gridStructure.competencies[1].indicators[0].id,
      ];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(4);
    });
  });
});
