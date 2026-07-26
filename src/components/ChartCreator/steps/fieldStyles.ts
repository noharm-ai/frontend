import type { CSSProperties } from "react";
import type { ColorPalette } from "../types";

export const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#454545",
  marginBottom: 2,
};

export const hintStyle: CSSProperties = {
  fontSize: 12,
  color: "#888",
  marginTop: 2,
};

export const PALETTE_OPTIONS: {
  label: string;
  value: ColorPalette;
  colors: string[];
}[] = [
  { label: "Padrão", value: "default", colors: [] },
  {
    label: "Secundário",
    value: "secondary",
    colors: ["#2e3c5a", "#7ebe9a", "#70bdc3", "#e46666", "#f2b530"],
  },
  {
    label: "Azuis",
    value: "blues",
    colors: ["#1a237e", "#1565c0", "#1976d2", "#42a5f5", "#90caf9"],
  },
  {
    label: "Verdes",
    value: "greens",
    colors: ["#1b5e20", "#388e3c", "#66bb6a", "#a5d6a7", "#c8e6c9"],
  },
  {
    label: "Quente",
    value: "warm",
    colors: ["#bf360c", "#e64a19", "#ff7043", "#ffa726", "#ffca28"],
  },
  {
    label: "Pastel",
    value: "pastel",
    colors: ["#b39ddb", "#90caf9", "#80cbc4", "#a5d6a7", "#ffcc80"],
  },
  {
    label: "Contraste",
    value: "contrast",
    colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"],
  },
];
