import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import Progress from "components/Progress";

export function ProcessingStep() {
  const { t } = useTranslation();
  const progress = useSelector(
    (state) => state.multipleInterventionOutcome.progress,
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Progress
          type="circle"
          percent={Math.round(progress)}
          strokeColor={{
            "0%": "rgb(112, 189, 196)",
            "100%": "rgb(126, 190, 154)",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          marginTop: "15px",
          marginBottom: "20px",
        }}
      >
        <Heading $size="16px">{t("multipleIntervention.applying")}</Heading>
      </div>
    </>
  );
}
