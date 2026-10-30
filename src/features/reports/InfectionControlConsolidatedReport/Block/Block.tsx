import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

import Tooltip from "components/Tooltip";
import { ChartCard } from "styles/Report.style";

import {
  BlockContainer,
  BlockTitle,
} from "../InfectionControlConsolidatedReport.style";

interface BlockProps {
  title: string;
  // how the numbers of the block are calculated
  help: string;
  loading?: boolean;
  kb?: string;
  children: ReactNode;
}

/** A chart or table of the report, titled, with how it is calculated. */
export function Block({
  title,
  help,
  loading = false,
  kb,
  children,
}: BlockProps) {
  const { t } = useTranslation();

  return (
    <BlockContainer>
      <Spin spinning={loading}>
        <ChartCard className={loading ? "loading" : ""} data-kb={kb}>
          <BlockTitle>
            {title}
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
                style={{ color: "#8c8c8c", cursor: "help", fontSize: 14 }}
                aria-label={t("infectionControlConsolidated.howCalculated")}
              />
            </Tooltip>
          </BlockTitle>
          {children}
        </ChartCard>
      </Spin>
    </BlockContainer>
  );
}
