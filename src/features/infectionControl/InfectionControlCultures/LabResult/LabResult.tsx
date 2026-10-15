import DOMPurify from "dompurify";

import { CultureResult } from "../InfectionControlCultures.style";

// the result some labs write as HTML (<div><label>RESULTADO: </label>
// <span>...</span></div>): only the tags that lay it out are kept
const HTML = /<[a-z][\s\S]*>/i;
const ALLOWED_TAGS = ["div", "span", "label", "p", "br", "b", "strong", "i"];

/**
 * The lab's result of a culture (resultprevio) as the lab wrote it: label and
 * value lines when it comes as sanitized HTML, the lines of the text when it
 * comes plain
 */
export function LabResult({ value }: { value: string | null }) {
  if (!value) {
    return <span className="muted">-</span>;
  }

  if (!HTML.test(value)) {
    return <CultureResult className="plain">{value}</CultureResult>;
  }

  return (
    <CultureResult
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(value, { ALLOWED_TAGS, ALLOWED_ATTR: [] }),
      }}
    />
  );
}
