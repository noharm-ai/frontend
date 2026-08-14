import PermissionService from "services/PermissionService";
import Permission from "models/Permission";

// ADMIN_EXAMS is the deprecated fallback (see models/Permission.js).
// Remove it from both checks once the backend release is out.

export const canReadExamConfig = (): boolean =>
  PermissionService().hasAny([
    Permission.READ_CONFIG_EXAMS,
    Permission.ADMIN_EXAMS,
  ]);

export const canWriteExamConfig = (): boolean =>
  PermissionService().hasAny([
    Permission.WRITE_CONFIG_EXAMS,
    Permission.ADMIN_EXAMS,
  ]);
