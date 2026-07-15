import { useTranslation } from "react-i18next";
import { TrophyOutlined } from "@ant-design/icons";

import { BadgesPanel } from "./TrainingCentral.style";

export function TrainingBadges() {
  const { t } = useTranslation();

  return (
    <BadgesPanel>
      <TrophyOutlined />
      <h3>{t("trainingCentral.badgesTitle")}</h3>
      <p>{t("trainingCentral.badgesEmpty")}</p>
    </BadgesPanel>
  );
}
