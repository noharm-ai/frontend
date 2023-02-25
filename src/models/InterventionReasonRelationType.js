export default class InterventionReasonRelationType {
  static DO_NOT_APPLY = 0;
  static HAS_OPTIONAL_RELATION = 1;
  static HAS_REQUIRED_RELATION = 2;

  static getTypesWithRelation() {
    return [
      InterventionReasonRelationType.HAS_OPTIONAL_RELATION,
      InterventionReasonRelationType.HAS_REQUIRED_RELATION,
    ];
  }

  static isRequired(type) {
    return type === InterventionReasonRelationType.HAS_REQUIRED_RELATION;
  }
}
