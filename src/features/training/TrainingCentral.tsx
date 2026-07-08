import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Progress, Row, Col } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import notification from "components/notification";
import Empty from "components/Empty";
import { getErrorMessage } from "utils/errorHandler";

import { fetchTrainingList } from "./TrainingCentralSlice";
import { TrainingModuleRow } from "./TrainingModuleRow";
import { TrainingBadges } from "./TrainingBadges";
import { ModuleList, SideColumn, ProgressPanel } from "./TrainingCentral.style";
import { PageHeader } from "styles/PageHeader.style";

type TrainingModuleStatus = "completed" | "current" | "locked";

const getModuleStatus = (index: number): TrainingModuleStatus =>
  index === 0 ? "current" : "locked";

export function TrainingCentral() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.trainingCentral.list);
  const status = useAppSelector((state) => state.trainingCentral.status);

  useEffect(() => {
    dispatch(fetchTrainingList({})).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      }
    });
  }, [dispatch, t]);

  const sortedList = useMemo(
    () => [...list].sort((a, b) => a.position - b.position),
    [list],
  );

  const total = sortedList.length;
  const completedCount = sortedList.filter(
    (_, index) => getModuleStatus(index) === "completed",
  ).length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">{t("trainingCentral.title")}</h1>
          <h1 className="page-header-legend">
            {t("trainingCentral.subtitle")}
          </h1>
        </div>
      </PageHeader>

      <Row gutter={24}>
        <Col xs={17}>
          <ModuleList>
            {status !== "loading" && !sortedList.length && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("trainingCentral.empty")}
              />
            )}

            {sortedList.map((module, index) => (
              <TrainingModuleRow
                key={module.id}
                module={module}
                status={getModuleStatus(index)}
                onContinue={() => navigate(`/treinamento/${module.id}`)}
              />
            ))}
          </ModuleList>
        </Col>

        <Col xs={7}>
          <SideColumn>
            {total > 0 && (
              <ProgressPanel>
                <h3>{t("trainingCentral.progressTitle")}</h3>
                <Progress type="circle" percent={percent} size={72} />
                <span>
                  {t("trainingCentral.completedCount", {
                    done: completedCount,
                    total,
                  })}
                </span>
              </ProgressPanel>
            )}

            <TrainingBadges />
          </SideColumn>
        </Col>
      </Row>
    </>
  );
}
