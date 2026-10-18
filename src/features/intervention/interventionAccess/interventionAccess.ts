import Permission from "models/Permission";
import PermissionService from "services/PermissionService";

/**
 * Whether the user cannot change an intervention: the ones an infection
 * control review recorded are kept by infection control (the backend checks
 * it again on save)
 */
export const isInterventionLocked = (
  intervention?: { idInfectionControlEvaluation?: string | null } | null,
) =>
  !!intervention?.idInfectionControlEvaluation &&
  !PermissionService().has(Permission.WRITE_INFECTION_CONTROL);
