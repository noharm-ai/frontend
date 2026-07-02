/**
 * Builds a syntactically valid JWT that is never verified by anyone:
 * the backend is fully mocked and the frontend only base64-decodes the
 * payload (see src/store/middlewares/autoRefreshToken.js) to read `exp`.
 *
 * `exp` defaults to one year from now so the autoRefreshToken middleware
 * never triggers a /refresh-token call mid-test.
 */
export function fakeJwt(
  expInSeconds: number = Date.now() / 1000 + 60 * 60 * 24 * 365,
): string {
  const b64 = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const header = b64({ alg: "HS256", typ: "JWT" });
  const payload = b64({
    fresh: false,
    iat: Math.floor(Date.now() / 1000),
    type: "access",
    exp: Math.floor(expInSeconds),
  });

  return `${header}.${payload}.e2e-fake-signature`;
}
