import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from "@ant-design/icons";

import PrescriptionCard from "components/PrescriptionCard";
import Tooltip from "components/Tooltip";
import NumericValue from "components/NumericValue";

export default function ScoreCard({ prescription }) {
  const { t } = useTranslation();

  const globalScore = prescription.features?.globalScore;
  const variation = prescription.features?.scoreVariation?.variation;

  const getScoreColor = () => {
    if (globalScore > 90) {
      return "#E53935";
    }

    if (globalScore > 60) {
      return "#FB8C00";
    }

    if (globalScore > 10) {
      return "#FDD835";
    }

    if (globalScore > 0) {
      return "#7CB342";
    }

    return "#959595";
  };

  return (
    <PrescriptionCard style={{ height: "100%" }}>
      <div className="header">
        <h3 className="title">Escore Global</h3>
      </div>
      <div className="content">
        <div className="stat-variation">
          <Tooltip title={t("screeningList.clGlobalScoreHint")}>
            <div className="stat-variation-number">
              {globalScore !== null && globalScore !== undefined
                ? globalScore
                : "-"}

              {prescription.agg && <VariationIndicator variation={variation} />}
            </div>
          </Tooltip>
          {prescription.agg && (
            <Tooltip title="Variação do escore global comparada com o escore imediatamente anterior">
              <div className="stat-variation-percentage">
                <NumericValue
                  suffix="%"
                  value={variation}
                  prefix={variation > 0 ? "+" : ""}
                />
              </div>
            </Tooltip>
          )}
        </div>
      </div>
      <div
        className="stat-marker"
        style={{ background: getScoreColor() }}
      ></div>
    </PrescriptionCard>
  );
}

const VariationIndicator = ({ variation }) => {
  if (variation > 0) {
    return <ArrowUpOutlined />;
  }

  if (variation < 0) {
    return <ArrowDownOutlined />;
  }

  if (variation === 0) {
    return <MinusOutlined />;
  }

  return null;
};
