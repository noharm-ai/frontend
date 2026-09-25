import Permission from "models/Permission";
import PermissionService from "services/PermissionService";

export const canWriteKnowledgeBase = () =>
  PermissionService().has(Permission.WRITE_KNOWLEDGE_BASE);
