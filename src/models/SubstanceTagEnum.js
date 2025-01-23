export class SubstanceTagEnum {
  static ANTIMICRO = "antimicro";
  static SURVEILLANCE = "surveillance";
  static CONTROLLED = "controlled";
  static DIALYZABLE = "dialyzable";
  static FASTING = "fasting";
  static PIM = "pim";
  static NOT_STANDARDIZED = "not_standardized";
  static CHEMOTERAPY = "chemoterapy";
  static NOT_VALIDATED = "not_validated";
  static TUBE = "tube";
  static NO_DOSEMAX = "no_dosemax";

  static getSubstanceTags = (t) => {
    const types = Object.keys(SubstanceTagEnum)
      .filter((k) => typeof SubstanceTagEnum[k] === "string")
      .map((k) => ({
        id: SubstanceTagEnum[k],
        label: t(`substanceTag.${SubstanceTagEnum[k]}`),
      }));

    return types.sort((a, b) => `${a?.label}`.localeCompare(`${b?.label}`));
  };
}
