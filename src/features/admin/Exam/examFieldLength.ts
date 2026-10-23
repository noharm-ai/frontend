// column sizes of segmentoexame (backend models/segment.py)
export const EXAM_FIELD_MAX = {
  type: 100,
  name: 250,
  initials: 50,
  ref: 250,
};

// what each character takes once the backend html-escapes it (markupsafe)
const ESCAPED_SIZE: Record<string, number> = {
  "&": 5, // &amp;
  "<": 4, // &lt;
  ">": 4, // &gt;
  '"': 5, // &#34;
  "'": 5, // &#39;
};

// the length the backend will store, which is what the column limits
export const storedLength = (text?: string | null): number => {
  if (!text) {
    return 0;
  }

  return Array.from(text).reduce(
    (total, char) => total + (ESCAPED_SIZE[char] ?? 1),
    0,
  );
};
