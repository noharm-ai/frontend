// Mirrors backend utils/certificateutils.py. Crockford Base32: no I, L, O or U,
// which is what lets the misread characters fold onto 0 and 1.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export const CODE_LENGTH = 12;

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

/** XXXX-XXXX-XXXX, for display. Codes travel bare. */
export function formatCertificateCode(code: string): string {
  return (code.match(/.{1,4}/g) ?? []).join("-");
}
