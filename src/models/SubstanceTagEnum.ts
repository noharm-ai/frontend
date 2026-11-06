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

  static getSubstanceTags = (t: (key: string) => string) => {
    const enumValues = SubstanceTagEnum as unknown as Record<string, unknown>;
    const types = Object.keys(enumValues)
      .map((k) => enumValues[k])
      .filter((v): v is string => typeof v === "string")
      .map((id) => ({
        id,
        label: t(`substanceTag.${id}`),
      }));

    return types.sort((a, b) => `${a?.label}`.localeCompare(`${b?.label}`));
  };
}
