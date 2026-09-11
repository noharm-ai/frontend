import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";
import { BellOutlined } from "@ant-design/icons";
import { Flex, Segmented } from "antd";

import ExamListItem from "./ExamListItem";
import Tooltip from "components/Tooltip";
import Badge from "components/Badge";
import Button from "components/Button";
import PrescriptionCard from "components/PrescriptionCard";
import Empty from "components/Empty";
import Help from "components/Help";
import { Carousel } from "components/Carousel";
import { setExamsModalAdmissionNumber } from "features/exams/ExamModal/ExamModalSlice";
import { CultureTab } from "features/culture/CultureTab/CultureTab";
import { CultureCardFooter } from "features/culture/CultureCardFooter/CultureCardFooter";
import { countResistantInUse } from "features/culture/cultureResistance";
import {
  trackPrescriptionAction,
  TrackedPrescriptionAction,
} from "src/utils/tracker";

const TAB_EXAMS = "exams";
const TAB_CULTURE = "culture";

export default function ExamCard({
  exams,
  cultures,
  siderCollapsed,
  count,
  admissionNumber,
  prescription,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [tab, setTab] = useState(TAB_EXAMS);

  // the culture card sits behind a tab, so a resistant drug the patient is on
  // would go unseen unless the tab itself says so
  const resistantInUse = countResistantInUse(cultures);

  const openModal = () => {
    dispatch(setExamsModalAdmissionNumber(admissionNumber));
    trackPrescriptionAction(TrackedPrescriptionAction.SHOW_EXAMS);
  };

  return (
    <PrescriptionCard className="full-height max-height">
      <div className="header">
        <h3 className="title">
          {/* the tab is always offered: a patient with no culture in the last
              60 days still has the full report behind it, and the absence is
              itself an answer the user came for */}
          <Segmented
            size="small"
            value={tab}
            onChange={setTab}
            options={[
              { label: t("tableHeader.exams"), value: TAB_EXAMS },
              {
                label:
                  resistantInUse > 0 ? (
                    <Tooltip
                      title={t("culture.resistantInUseTabHint", {
                        count: resistantInUse,
                      })}
                    >
                      <Badge dot offset={[5, 2]}>
                        <span className="culture-tab-alert">
                          {t("culture.tabTitle")}
                        </span>
                      </Badge>
                    </Tooltip>
                  ) : (
                    t("culture.tabTitle")
                  ),
                value: TAB_CULTURE,
              },
            ]}
          />
          <Help
            text={
              tab === TAB_CULTURE
                ? // the rows open the antibiogram, which the list itself has
                  // no room to say
                  `${t("culture.hint")} ${t("culture.detailsHint")}`
                : t("tooltips.recentExams")
            }
          />
        </h3>
      </div>
      <div className="content">
        <Flex align="center" style={{ height: "100%" }}>
          {tab === TAB_CULTURE ? (
            <CultureTab cultures={cultures} />
          ) : exams && exams.length > 0 ? (
            <div style={{ width: "100%" }}>
              <Carousel infinite={false}>
                {[
                  [0, 10],
                  [10, 20],
                ].map((chunk) => (
                  <div key={chunk[0]}>
                    <div className="exam-list">
                      {exams.slice(chunk[0], chunk[1]).map((exam) => (
                        <div className="exam-item" key={exam.key}>
                          <ExamListItem
                            exam={exam}
                            siderCollapsed={siderCollapsed}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          ) : (
            <Flex align="center" justify="center" style={{ width: "100%" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("screeningList.empty")}
              />
            </Flex>
          )}
        </Flex>
      </div>
      {tab === TAB_CULTURE ? (
        <div className="footer">
          <CultureCardFooter cultures={cultures} prescription={prescription} />
        </div>
      ) : (
        !isEmpty(exams) && (
          <div className="footer">
            <div className="stats">
              {count > 0 && (
                <div>
                  <Tooltip title={t("screeningList.clExamHint")}>
                    <BellOutlined style={{ fontSize: "18px" }} />{" "}
                    <span>{count}</span>
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="action">
              <Button
                type="link"
                className="gtm-btn-exams-all"
                onClick={() => openModal()}
              >
                Ver todos
              </Button>
            </div>
          </div>
        )
      )}
    </PrescriptionCard>
  );
}
