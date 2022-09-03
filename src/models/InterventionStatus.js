const interventionStatus = {
  getClosedStatuses: () => {
    return ["a", "n", "x", "j"];
  },
  translate: (status, t) => {
    switch (status) {
      case "a":
        return {
          label: t("interventionStatus.a"),
          color: "green",
        };

      case "n":
        return {
          label: t("interventionStatus.n"),
          color: "red",
        };
      case "j":
        return {
          label: t("interventionStatus.j"),
          color: "red",
        };
      case "x":
        return {
          label: t("interventionStatus.x"),
          color: null,
        };
      case "s":
        return {
          label: t("interventionStatus.s"),
          color: "orange",
        };
      default:
        return {
          label: `Indefinido (${status})`,
          color: null,
        };
    }
  },
};

export default interventionStatus;
