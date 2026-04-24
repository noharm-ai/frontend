type MeasureUnitOption = {
  value: string;
  label: string;
  description: string;
};

const UNITS: MeasureUnitOption[] = [
  { value: "mg", label: "mg", description: "Miligrama" },
  { value: "ml", label: "ml", description: "Mililitro" },
  { value: "mcg", label: "mcg", description: "Micrograma" },
  { value: "un", label: "un", description: "Unidade" },
  { value: "UI", label: "UI", description: "Unidade Internacional" },
];

export class MeasureUnitEnum {
  static MG = "mg";
  static ML = "ml";
  static MCG = "mcg";
  static UN = "un";
  static UI = "UI";

  static getDefaultUnits = (): MeasureUnitOption[] => UNITS;

  static getDescription = (value: string): string =>
    UNITS.find((u) => u.value === value)?.description ?? value;
}
