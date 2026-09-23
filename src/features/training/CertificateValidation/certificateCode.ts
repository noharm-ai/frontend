// Mirrors backend utils/certificateutils.py. Crockford Base32: no I, L, O or U,
// which is what lets the misread characters fold onto 0 and 1.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export const CODE_LENGTH = 12;
// codes issued by NoHarm Aulas (backend EXTERNAL_CODE_LENGTH): shorter than
// training codes, which is how the backend tells the two apart
export const EXTERNAL_CODE_LENGTH = 8;

export function hasValidCodeLength(normalized: string): boolean {
  return (
    normalized.length === CODE_LENGTH ||
    normalized.length === EXTERNAL_CODE_LENGTH
  );
}

/**
 * Fold what a human typing off a printed certificate gets wrong, then drop
 * everything outside the alphabet (the group dashes, spaces).
 *
 * The order matters: stripping first would delete the very I/L/O characters
 * the fold is meant to rescue.
 */
export function normalizeCertificateCode(code: string): string {
  if (!code) return "";

  return code
    .toUpperCase()
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0")
    .split("")
    .filter((char) => ALPHABET.includes(char))
    .join("");
}

/** XXXX-XXXX-XXXX (or XXXX-XXXX), for display. Codes travel bare. */
export function formatCertificateCode(code: string): string {
  return (code.match(/.{1,4}/g) ?? []).join("-");
}
