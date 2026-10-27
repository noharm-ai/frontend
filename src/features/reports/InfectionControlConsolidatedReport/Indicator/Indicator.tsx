import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

import Tooltip from "components/Tooltip";

import { IndicatorCard } from "./Indicator.style";

interface IndicatorProps {
  title: string;
  value: ReactNode;
  // how the number is calculated
  help: string;
  detail?: ReactNode;
  color?: "blue" | "green" | "orange" | "red";
  loading?: boolean;
  kb?: string;
}

/** One number of the report, with how it is calculated behind the help icon. */
export function Indicator({
  title,
  value,
  help,
  detail,
  color = "blue",
  loading = false,
  kb,
}: IndicatorProps) {
  const { t } = useTranslation();

  return (
    <Spin spinning={loading}>
      <IndicatorCard className={`indicator ${color}`} data-kb={kb}>
        <div className="indicator-title">
          <span>{title}</span>
          <Tooltip
            title={
              <>
                <strong>
                  {t("infectionControlConsolidated.howCalculated")}:
                </strong>{" "}
                {help}
              </>
            }
          >
            <QuestionCircleOutlined
              className="indicator-help"
              aria-label={t("infectionControlConsolidated.howCalculated")}
            />
          </Tooltip>
        </div>
        <div className="indicator-value">{value}</div>
        <div className="indicator-detail">{detail}</div>
      </IndicatorCard>
    </Spin>
  );
}
