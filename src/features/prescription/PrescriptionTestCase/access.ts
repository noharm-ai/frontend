import { useSelector } from "react-redux";

import Feature from "models/Feature";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";

/**
 * Whether the user can create test case prescriptions: maintainers, in a
 * schema with the PRESCRIPTION_TEST_CASE feature (the schema's own, not a
 * user's). The backend checks the same feature and is not served in
 * production.
 */
export function useCanCreateTestCases(): boolean {
  const schemaFeatures: string[] | undefined = useSelector(
    (state: any) => state.user.account.schemaFeatures,
  );

  return (
    PermissionService().has(Permission.MAINTAINER) &&
    !!schemaFeatures?.includes(Feature.PRESCRIPTION_TEST_CASE)
  );
}
