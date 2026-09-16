import Permission from "models/Permission";
import IntegrationStatus from "models/IntegrationStatus";
import PermissionService from "services/PermissionService";
import { useAppSelector } from "src/store";
import { useTrainingStatus } from "features/training/useTrainingStatus";

/**
 * Whether the logged user may open a support ticket. Users who still owe
 * mandatory training may not; ADMIN_SUPPORT holders can override it for an
 * urgent ticket.
 *
 * The gate only applies once the schema is in production: during integration
 * the team is still setting the client up and support is how they do it, so
 * pending training must not stand in the way.
 *
 * The backend enforces the same rule in support_service.create_ticket, so this
 * only decides what the UI offers - it is not the security boundary.
 */
export function useTicketCreationBlock() {
  const { isPending } = useTrainingStatus();
  const integrationStatus = useAppSelector(
    (state) => (state.app as any).config.integrationStatus,
  );
  const canBypass = PermissionService().has(Permission.ADMIN_SUPPORT);

  const blocked =
    isPending && integrationStatus === IntegrationStatus.PRODUCTION;

  return {
    blocked,
    // the urgent override is offered only when it would actually work
    requiresUrgent: blocked && canBypass,
  };
}
