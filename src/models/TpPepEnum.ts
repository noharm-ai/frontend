export class TpPepEnum {
  static AGHU = "AGHU";
  static AGHUSE = "AGHUSE";
  static ARS_VITAE = "ARS_VITAE";
  static DGS = "DGS";
  static ERP_SMART_HEALTH = "ERP_SMART_HEALTH";
  static GESTHOS = "GESTHOS";
  static G_HOSP = "G_HOSP";
  static IW = "IW";
  static JME = "JME";
  static MICROMED = "MICROMED";
  static MV = "MV";
  static PEC = "PEC";
  static PROPRIO = "PROPRIO";
  static SALUX = "SALUX";
  static SIHO = "SIHO";
  static SYSTEMA = "SYSTEMA";
  static TASY = "TASY";
  static TASY_CPOE = "TASY_CPOE";
  static VITAI = "VITAI";
  static WARELINE = "WARELINE";

  static getList = () => {
    const items = [];
    for (const key in TpPepEnum) {
      const value: any = TpPepEnum[key as keyof typeof TpPepEnum];

      if (typeof value === "string" && key !== "getList") {
        items.push({
          label:
            value === "PEC" ? "PEC (Prontuário Eletrônico do Cidadão)" : value,
          value: value,
        });
      }
    }
    return items;
  };
}
