const clinicalNotesIndicator = {
  list: (t) => [
    {
      key: "acesso",
      label: t("clinicalNotesIndicator.acesso"),
      value: "acesso",
      color: "#68FACF",
      backgroundColor: "#68FACF0A",
      category: "priority",
    },
    {
      key: "allergy",
      label: t("clinicalNotesIndicator.allergy"),
      value: "alergia",
      color: "#E65100",
      backgroundColor: "rgba(230, 81, 0, 0.1)",
      category: "priority",
    },
    {
      key: "conduct",
      label: t("clinicalNotesIndicator.conduct"),
      value: "conduta",
      color: "#ff9f1c",
      backgroundColor: "rgba(255, 159, 28, 0.1)",
      category: "priority",
    },
    {
      key: "info",
      label: t("clinicalNotesIndicator.info"),
      value: "dados",
      color: "#1919e0",
      backgroundColor: "rgba(25,25,224, 0.1)",
      category: "info",
    },
    {
      key: "dialysis",
      label: t("clinicalNotesIndicator.dialysis"),
      value: "dialise",
      color: "#3b3b35",
      backgroundColor: "rgba(59, 59, 53, 0.1)",
      category: "info",
    },
    {
      key: "diseases",
      label: t("clinicalNotesIndicator.diseases"),
      value: "doencas",
      color: "#f1d302",
      backgroundColor: "rgba(241, 211, 2, 0.1)",
      category: "priority",
    },
    {
      key: "diliexc",
      label: t("clinicalNotesIndicator.diliexc"),
      value: "diliexc",
      color: "#9924FA",
      backgroundColor: "#9924FA0A",
      category: "info",
    },
    {
      key: "complication",
      label: t("clinicalNotesIndicator.complication"),
      value: "complicacoes",
      color: "#e71d36",
      backgroundColor: "rgba(231, 29, 54, 0.1)",
      category: "priority",
    },
    {
      key: "germes",
      label: t("clinicalNotesIndicator.germes"),
      value: "germes",
      color: "#22FA67",
      backgroundColor: "#22FA670A",
      category: "priority",
    },
    {
      key: "gestante",
      label: t("clinicalNotesIndicator.gestante"),
      value: "gestante",
      color: "#6BC6FA",
      backgroundColor: "#6BC6FA0A",
      category: "info",
    },
    {
      key: "medications",
      label: t("clinicalNotesIndicator.medications"),
      value: "medicamentos",
      color: "#662e9b",
      backgroundColor: "rgba(102,46,155, 0.1)",
      category: "priority",
    },
    {
      key: "names",
      label: t("clinicalNotesIndicator.names"),
      value: "nomes",
      color: "#808080",
      backgroundColor: "rgba(128, 128, 128, 0.1)",
      category: "info",
    },
    {
      key: "resthid",
      label: t("clinicalNotesIndicator.resthid"),
      value: "resthid",
      color: "#316DF7",
      backgroundColor: "#316DF70A",
      category: "info",
    },
    {
      key: "signs",
      label: t("clinicalNotesIndicator.signs"),
      value: "sinais",
      color: "#c157a3",
      backgroundColor: "rgba(193,87,163, 0.1)",
      category: "info",
    },
    {
      key: "symptoms",
      label: t("clinicalNotesIndicator.symptoms"),
      value: "sintomas",
      color: "#43bccd",
      backgroundColor: "rgba(67,188,205, 0.1)",
      category: "priority",
    },
  ],

  listByKey(keyArray, t) {
    return this.list(t).filter((i) => keyArray.indexOf(i.key) !== -1);
  },

  listByCategory(category, t) {
    return this.list(t).filter((i) => i.category === category);
  },
};

export default clinicalNotesIndicator;
