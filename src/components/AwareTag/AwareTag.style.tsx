import styled from "styled-components";

import { AWARE_COLORS, awareKey } from "features/culture/awareLevel";

// the AWaRe group of a drug, in a list: the dot carries the colour and a
// single letter the group. Both lists it sits in (the culture card and the
// prescription drug list) are too narrow to spell the group out — the drug
// name is what identifies the row — so the tag is kept to the width of an
// icon and the word is left to the tooltip
export const Badge = styled.div<{ $level: number }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  padding: 1px 5px;
  border-radius: 10px;
  background: #f1f3f7;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  white-space: nowrap;
  color: #4b5872;

  .aware-dot {
    width: 7px;
    height: 7px;
    flex-shrink: 0;
    border-radius: 50%;
    /* awareLevel.js is untyped, so the key it answers is narrowed here */
    background: ${(props) =>
      AWARE_COLORS[awareKey(props.$level) as keyof typeof AWARE_COLORS]};
  }
`;
