import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import { TagTypeEnum } from "models/TagTypeEnum";

/** Write access to every tag type. */
export const canWriteTags = (): boolean =>
  PermissionService().has(Permission.WRITE_TAGS);

/**
 * WRITE_PATIENT_TAGS grants write access to navigation tags only (see the
 * tagType/NAVEGACAO_ checks in admin_tag_service.upsert_tag), and navigation
 * tags are only listed and selectable with READ_NAV — so without it there is
 * nothing this permission can actually write here.
 */
const canWriteNavigationTags = (): boolean =>
  PermissionService().has(Permission.WRITE_PATIENT_TAGS) &&
  PermissionService().has(Permission.READ_NAV);

/** Any write access at all: enables "Adicionar marcador". */
export const canCreateTags = (): boolean =>
  canWriteTags() || canWriteNavigationTags();

/** Write access to one existing tag. */
export const canWriteTag = (tagType?: number): boolean =>
  canWriteTags() ||
  (canWriteNavigationTags() && tagType === TagTypeEnum.PATIENT_NAVIGATION);
