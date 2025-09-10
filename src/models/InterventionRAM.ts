export const ramSeverity = {
  "1": "Leve",
  "2": "Moderada",
  "3": "Grave",
};

export const ramSeverityDetail = {
  "1": "Resultou em óbito",
  "2": "Incapacidade, persistente ou significativa",
  "3": "Ameaça à vida",
  "4": "Anomalia congênita ou malformação",
  "5": "Hospitalização/Prolongamento da hospitalização",
  "6": "Outro efeito clinicamente significativo",
};

export const ramCausality = {
  comprovada: "Comprovada",
  provavel: "Provável",
  possivel: "Possível",
  duvidosa: "Duvidosa",
};

export const ramDetection = {
  gatilho: "Gatilho",
  ia: "IA",
  outro: "Outro",
};

export const ramFields = [
  {
    field: "detection",
    render: (value: keyof typeof ramDetection) => ramDetection[value],
  },
  {
    field: "internalNotificationCode",
    render: (value: string) => value,
  },
  {
    field: "anvisaCode",
    render: (value: string) => value,
  },
  {
    field: "brand",
    render: (value: string) => value,
  },
  {
    field: "batch",
    render: (value: string) => value,
  },
  {
    field: "expiration",
    render: (value: string) => value,
  },
  {
    field: "symptoms",
    render: (value: string) => value,
  },
  {
    field: "suspended",
    render: (value: boolean) => (value ? "Sim" : "Não"),
  },
  {
    field: "describedInLeaflet",
    render: (value: boolean) => (value ? "Sim" : "Não"),
  },
  {
    field: "severity",
    render: (value: keyof typeof ramSeverity) => ramSeverity[value],
  },
  {
    field: "severityDetail",
    render: (value: keyof typeof ramSeverityDetail) => ramSeverityDetail[value],
  },
  {
    field: "causality",
    render: (value: keyof typeof ramCausality) => ramCausality[value],
  },
];
