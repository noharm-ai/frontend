import Permission from "models/Permission";
import PermissionService from "services/PermissionService";

// the tab that hosts ResetPassword must not render when there is nothing to
// show, so the guard lives here instead of being duplicated by the caller.
// Kept out of ResetPassword.jsx so that file only exports components.
export function canManageResetPassword(user) {
  return (
    !!user.id &&
    PermissionService().hasAny([
      Permission.SEND_RESET_PASSWORD_EMAIL,
      Permission.GENERATE_RESET_PASSWORD_LINK,
      Permission.ADMIN_USERS,
      Permission.READ_RESET_PASSWORD_HISTORY,
    ])
  );
}
