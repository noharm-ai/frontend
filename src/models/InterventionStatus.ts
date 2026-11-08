type Translate = (key: string) => string;

const interventionStatus = {
  getClosedStatuses: (): string[] => {
    return ["a", "n", "x", "j"];
  },
  translate: (
    status: string,
    t: Translate
  ): { label: string; color: string | null } => {
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
