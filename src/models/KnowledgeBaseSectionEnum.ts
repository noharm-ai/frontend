import { KnowledgeBasePathEnum } from "./KnowledgeBasePathEnum";

export interface KnowledgeBaseSection {
  value: string;
  label: string;
  // the KnowledgeBasePathEnum value of the page the section belongs to
  page: string;
}

// Sections of a page that can carry their own knowledge base articles. To add a
// section, register it here and render <KnowledgeBaseSectionHelp section="..." />
// where it lives. Keys are stored in the database: never rename one.
export class KnowledgeBaseSectionEnum {
  static PRESCRIPTION_DRUGS = "prescricao.medicamentos";
  static PRESCRIPTION_SOLUTIONS = "prescricao.solucoes";
  static PRESCRIPTION_PROCEDURES = "prescricao.procedimentos";
  static PRESCRIPTION_DIET = "prescricao.dietas";
  static PRESCRIPTION_INTERVENTIONS = "prescricao.intervencoes";

  static getList = (): KnowledgeBaseSection[] => [
    {
      value: KnowledgeBaseSectionEnum.PRESCRIPTION_DRUGS,
      label: "Aba Medicamentos",
      page: "Prescrição",
    },
    {
      value: KnowledgeBaseSectionEnum.PRESCRIPTION_SOLUTIONS,
      label: "Aba Soluções",
      page: "Prescrição",
    },
    {
      value: KnowledgeBaseSectionEnum.PRESCRIPTION_PROCEDURES,
      label: "Aba Procedimentos",
      page: "Prescrição",
    },
    {
      value: KnowledgeBaseSectionEnum.PRESCRIPTION_DIET,
      label: "Aba Dietas",
      page: "Prescrição",
    },
    {
      value: KnowledgeBaseSectionEnum.PRESCRIPTION_INTERVENTIONS,
      label: "Aba Intervenções",
      page: "Prescrição",
    },
  ];

  static getSection = (value: string): KnowledgeBaseSection | undefined =>
    KnowledgeBaseSectionEnum.getList().find((item) => item.value === value);

  // "Page › Section", or the raw key for a section no longer registered
  static getLabel = (value: string): string => {
    const section = KnowledgeBaseSectionEnum.getSection(value);
    return section ? `${section.page} › ${section.label}` : value;
  };

  static getOptions = () =>
    KnowledgeBasePathEnum.getList()
      .map((page) => ({
        label: page.label,
        options: KnowledgeBaseSectionEnum.getList()
          .filter((section) => section.page === page.value)
          .map((section) => ({ value: section.value, label: section.label })),
      }))
      .filter((group) => group.options.length > 0);
}
