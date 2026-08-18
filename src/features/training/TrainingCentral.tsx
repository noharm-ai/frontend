import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Progress, Row, Col } from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import notification from "components/notification";
import Empty from "components/Empty";
import { getErrorMessage } from "utils/errorHandler";

import { fetchTrainingList, ITrainingModule } from "./TrainingCentralSlice";
import { isModuleFinished } from "./trainingUtils";
import { TrainingModuleRow } from "./TrainingModuleRow";
import {
  ModuleList,
  SideColumn,
  ProgressPanel,
  ProgressRow,
  ProgressGroup,
  ProgressNote,
} from "./TrainingCentral.style";
import { PageHeader } from "styles/PageHeader.style";

type TrainingModuleStatus = "completed" | "current";

const getModuleStatus = (module: ITrainingModule): TrainingModuleStatus =>
  isModuleFinished(module) ? "completed" : "current";

const formatProgress = (percent?: number) =>
  percent === 100 ? (
    <CheckCircleTwoTone
      twoToneColor="#70bdc3"
      style={{
        fontSize: 34,
        display: "block",
        lineHeight: 1,
        margin: 0,
      }}
    />
  ) : (
    `${percent}%`
  );

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

  const mandatoryList = sortedList.filter((module) => module.mandatory);
  const optionalList = sortedList.filter((module) => !module.mandatory);

  const mandatoryCompleted = mandatoryList.filter(isModuleFinished).length;
  const mandatoryPercent =
    mandatoryList.length > 0
      ? Math.round((mandatoryCompleted / mandatoryList.length) * 100)
      : 0;

  const optionalCompleted = optionalList.filter(isModuleFinished).length;
  const optionalPercent =
    optionalList.length > 0
      ? Math.round((optionalCompleted / optionalList.length) * 100)
      : 0;

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

            {sortedList.map((module) => (
              <TrainingModuleRow
                key={module.id}
                module={module}
                status={getModuleStatus(module)}
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

                <ProgressRow>
                  {mandatoryList.length > 0 && (
                    <ProgressGroup>
                      <span className="progress-label">
                        {t("trainingCentral.progressMandatory")}
                      </span>
                      <Progress
                        type="circle"
                        percent={mandatoryPercent}
                        size={72}
                        format={formatProgress}
                      />
                      <span>
                        {t("trainingCentral.completedCount", {
                          done: mandatoryCompleted,
                          total: mandatoryList.length,
                        })}
                      </span>
                    </ProgressGroup>
                  )}

                  {optionalList.length > 0 && (
                    <ProgressGroup>
                      <span className="progress-label">
                        {t("trainingCentral.progressOptional")}
                      </span>
                      <Progress
                        type="circle"
                        percent={optionalPercent}
                        size={72}
                        format={formatProgress}
                      />
                      <span>
                        {t("trainingCentral.completedCount", {
                          done: optionalCompleted,
                          total: optionalList.length,
                        })}
                      </span>
                    </ProgressGroup>
                  )}
                </ProgressRow>

                {mandatoryList.length > 0 && (
                  <ProgressNote>
                    {t("trainingCentral.mandatoryExplanation")}
                  </ProgressNote>
                )}
              </ProgressPanel>
            )}
          </SideColumn>
        </Col>
      </Row>
    </>
  );
}
