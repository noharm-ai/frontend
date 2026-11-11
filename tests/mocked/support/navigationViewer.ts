/**
 * The permissions of the NAVIGATION_VIEWER role (backend security/role.py):
 * a navigator that only views. READ_NAV opens the navigation data and the
 * navigation settings pages; nothing in it writes, and WRITE_NAV (SOAP,
 * digital signature, care plan) stays with NAVIGATOR.
 */
export const NAVIGATION_VIEWER_PERMISSIONS = [
  "READ_REPORTS",
  "READ_PRESCRIPTION",
  "READ_BASIC_FEATURES",
  "READ_DISCHARGE_SUMMARY",
  "READ_SUPPORT",
  "READ_NAV",
];
