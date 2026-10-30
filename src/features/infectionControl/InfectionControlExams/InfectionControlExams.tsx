import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Empty, Popover, Tooltip } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BellOutlined,
  MinusOutlined,
} from "@ant-design/icons";

import { useAppDispatch } from "src/store";
import NumericValue from "components/NumericValue";
import { formatDate } from "utils/date";
import { setExamsModalAdmissionNumber } from "features/exams/ExamModal/ExamModalSlice";

import {
  IExamCardItem,
  IInfectionControlPatient,
} from "../InfectionControlSlice";
import { isExamAlert, sortExams } from "../exams";
import { ExamsBox } from "./InfectionControlExams.style";

interface InfectionControlExamsProps {
  patient: IInfectionControlPatient;
  exams: IExamCardItem[];
  alertExams: number;
}

type IExam = IExamCardItem["value"];

const TrendIcon = ({ delta }: { delta: number | null }) => {
  if (delta != null && delta > 0) {
    return <ArrowUpOutlined />;
  }

  if (delta != null && delta < 0) {
    return <ArrowDownOutlined />;
  }

  return <MinusOutlined />;
};

/**
 * The exams of the admission's latest prescription, the ones the screening
 * card shows, as a list: one exam a row by its name, its latest value and
 * where it is heading, the ones out of range on top. The exams come with the
 * antimicrobial timeline; every exam of the admission is behind "Ver todos".
 *
 * Its own card rather than the screening's (components/Screening/Exam/Card):
 * beside the cultures there is room for the names, and the cultures are
 * shown on their own (InfectionControlCultures)
 */
export function InfectionControlExams({
  patient,
  exams,
  alertExams,
}: InfectionControlExamsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // a timeline response without them shows the card empty, as the screening
  // card does
  const sorted = useMemo(() => sortExams(exams), [exams]);

  const details = (exam: IExam) => (
    <div>
      {exam.value != null && (
        <div>
          {t("tableHeader.value")}:{" "}
          <NumericValue
            value={exam.value}
            suffix={exam.unit ? ` ${exam.unit}` : ""}
          />
        </div>
      )}
      {exam.date && (
        <div>
          {t("patientCard.examDate")}:{" "}
          {formatDate(exam.date, "DD/MM/YYYY HH:mm")}
        </div>
      )}
      {exam.ref && (
        // the lab's reference comes in lines
        <div style={{ whiteSpace: "pre-line" }}>Ref: {exam.ref}</div>
      )}
      {exam.delta != null && (
        <div>
          {t("patientCard.examVariation")}: {exam.delta > 0 ? "+" : ""}
          {exam.delta}%
        </div>
      )}
    </div>
  );

  return (
    <ExamsBox data-testid="exams-card">
      <div className="exams-header">
        <h2 className="exams-title">{t("tableHeader.exams")}</h2>
        <Tooltip title={t("screeningList.clExamHint")}>
          <span className="exams-alerts" data-testid="exams-alerts">
            <BellOutlined /> {alertExams}
          </span>
        </Tooltip>
        <Button
          type="link"
          size="small"
          className="exams-all"
          onClick={() =>
            dispatch(setExamsModalAdmissionNumber(patient.admissionNumber))
          }
        >
          {t("infectionControl.exams.showAll")}
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Empty
          className="exams-empty"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("infectionControl.exams.empty")}
        />
      ) : (
        <ul className="exams-list">
          {sorted.map(({ key, value: exam }) => (
            <Popover
              key={key}
              title={exam.name ?? exam.initials}
              content={details(exam)}
              mouseEnterDelay={0.5}
              mouseLeaveDelay={0}
            >
              <li
                className={`exam-row ${isExamAlert(exam) ? "alert" : ""}`}
                data-testid="exam-row"
              >
                <span className="exam-name">{exam.name ?? exam.initials}</span>
                <span className="exam-value">
                  {exam.value ? <NumericValue value={exam.value} /> : "--"}
                </span>
                <span className="exam-trend">
                  {exam.value ? <TrendIcon delta={exam.delta} /> : null}
                </span>
              </li>
            </Popover>
          ))}
        </ul>
      )}

      <div className="exams-legend">
        <ArrowUpOutlined /> {t("infectionControl.exams.up")} ·{" "}
        <ArrowDownOutlined /> {t("infectionControl.exams.down")} ·{" "}
        <MinusOutlined /> {t("infectionControl.exams.stable")} · --{" "}
        {t("infectionControl.exams.noResult")}
      </div>
    </ExamsBox>
  );
}
