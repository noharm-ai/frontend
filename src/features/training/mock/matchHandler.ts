/**
 * Handler keys are "METHOD /path". Path segments starting with ":" match any
 * single segment: "GET /prescriptions/:id" matches "GET /prescriptions/199".
 * Exact keys win over parameterized ones. Query strings must be stripped by
 * the caller. Same matching rules as tests/mocked/support/mockApi.ts.
 */
export const findHandlerKey = (
  method: string,
  path: string,
  handlerKeys: string[],
): string | undefined => {
  const exact = `${method} ${path}`;
  if (handlerKeys.includes(exact)) {
    return exact;
  }

  const pathSegments = path.split("/").filter(Boolean);
  for (const key of handlerKeys) {
    const [keyMethod, keyPath] = key.split(" ");
    if (keyMethod !== method || !keyPath?.includes(":")) {
      continue;
    }
    const keySegments = keyPath.split("/").filter(Boolean);
    if (keySegments.length !== pathSegments.length) {
      continue;
    }
    const matches = keySegments.every(
      (segment, i) => segment.startsWith(":") || segment === pathSegments[i],
    );
    if (matches) {
      return key;
    }
  }
  return undefined;
};
