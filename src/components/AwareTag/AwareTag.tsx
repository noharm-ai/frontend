import React from "react";
import { useTranslation } from "react-i18next";

import Tooltip from "components/Tooltip";
import { hasAwareLevel } from "features/culture/awareLevel";

import { Badge } from "./AwareTag.style";

interface AwareTagProps {
  level?: number | null;
}

/**
 * How aggressive an antimicrobial is, on the WHO AWaRe scale
 * (substancia.tp_nivel_atb, backend AntimicrobialLevelEnum). Shown wherever a
 * drug is listed: the culture card (features/culture) and the prescription
 * drug list.
 */
export const AwareTag = ({
  level,
}: AwareTagProps): React.ReactElement | null => {
  const { t } = useTranslation();

  // the column is curated apart from the screens that read it, so an
  // antimicrobial nobody has classified yet is a normal state: the row says
  // nothing rather than carrying a grey tag on every drug
  if (!hasAwareLevel(level)) {
    return null;
  }

  const label = t(`culture.awareLevel.${level}`);

  return (
    // the word the letter stands for is one hover away, and nothing more:
    // what the scale itself means belongs where there is room to say it
    <Tooltip title={`${t("culture.awareLevel.label")}: ${label}`}>
      <Badge
        className={`culture-aware culture-aware-${level}`}
        $level={level as number}
      >
        <span className="aware-dot" />
        <span className="aware-label">{label.charAt(0)}</span>
      </Badge>
    </Tooltip>
  );
};
