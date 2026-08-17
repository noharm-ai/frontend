import Permission from "models/Permission";
import PermissionService from "services/PermissionService";
import { useTrainingStatus } from "features/training/useTrainingStatus";

/**
 * Whether the logged user may open a support ticket. Users who still owe
 * mandatory training may not; ADMIN_SUPPORT holders can override it for an
 * urgent ticket.
 *
 * The backend enforces the same rule in support_service.create_ticket, so this
 * only decides what the UI offers - it is not the security boundary.
 */
export function useTicketCreationBlock() {
  const { isPending } = useTrainingStatus();
  const canBypass = PermissionService().has(Permission.ADMIN_SUPPORT);

  return {
    blocked: isPending,
    // the urgent override is offered only when it would actually work
    requiresUrgent: isPending && canBypass,
  };
}
