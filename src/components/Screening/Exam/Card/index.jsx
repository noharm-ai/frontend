import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";
import { BellOutlined } from "@ant-design/icons";
import { Flex } from "antd";

import ExamListItem from "./ExamListItem";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import PrescriptionCard from "components/PrescriptionCard";
import Empty from "components/Empty";
import Help from "components/Help";
import { Carousel } from "components/Carousel";
import { setExamsModalAdmissionNumber } from "features/exams/ExamModal/ExamModalSlice";
import { trackFeature, TrackedFeature } from "src/utils/tracker";

export default function ExamCard({
  exams,
  siderCollapsed,
  count,
  admissionNumber,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openModal = () => {
    dispatch(setExamsModalAdmissionNumber(admissionNumber));
    trackFeature(TrackedFeature.MODAL_EXAMS);
  };

  return (
    <PrescriptionCard className="full-height max-height">
      <div className="header">
        <h3 className="title">
          {t("tableHeader.exams")}
          <Help text={t("tooltips.recentExams")} />
        </h3>
      </div>
      <div className="content">
        <Flex align="center" style={{ height: "100%" }}>
          {exams && exams.length > 0 ? (
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
      {!isEmpty(exams) && (
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
      )}
    </PrescriptionCard>
  );
}
