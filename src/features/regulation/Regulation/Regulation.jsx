import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Skeleton, Row, Col, Space } from "antd";
import { FileTextOutlined, ExperimentOutlined } from "@ant-design/icons";

import Empty from "components/Empty";
import notification from "components/notification";
import Button from "components/Button";
import RegulationStats from "./RegulationStats/RegulationStats";
import RegulationHistory from "./RegulationHistory/RegulationHistory";
import RegulationPatient from "./RegulationPatient/RegulationPatient";
import RegulationData from "./RegulationData/RegulationData";
import RegulationAction from "./RegulationAction/RegulationAction";
import RegulationSchedules from "./RegulationSchedules/RegulationSchedules";
import RegulationClinicalNotesModal from "./RegulationClinicalNotes/RegulationClinicalNotesModal";
import { RegulationAttachments } from "../RegulationAttribute/RegulationAttachments/RegulationAttachments";
import ExamsModal from "features/exams/ExamModal/ExamModal";
import {
  fetchRegulation,
  fetchPatient,
  reset,
  setClinicalNotesModal,
} from "./RegulationSlice";
import { setExamsModalAdmissionNumber } from "features/exams/ExamModal/ExamModalSlice";
import { formatDateTime } from "utils/date";

import { PageHeader } from "styles/PageHeader.style";

export default function Regulation() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.regulation.regulation.status);
  const solicitation = useSelector((state) => state.regulation.regulation.data);

  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    dispatch(fetchRegulation({ id })).then((response) => {
      if (response.error) {
        notification.error({ message: "Solicitação não encontrada" });
      } else {
        dispatch(fetchPatient());
      }
    });

    return () => {
      dispatch(reset());
    };
  }, [id, dispatch]);

  if (status === "loading") {
    return (
      <>
        <Skeleton
          title
          paragraph={false}
          loading={status === "loading"}
          active
        />
      </>
    );
  }

  if (status === "failed") {
    return <Empty description="Solicitação não encontrada" />;
  }

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Solicitação nº: {id}</h1>
          <div className="page-header-legend">
            Solicitado em {formatDateTime(solicitation.date)}
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            onClick={() => dispatch(setClinicalNotesModal(true))}
            icon={<FileTextOutlined />}
          >
            Evoluções
          </Button>

          <Button
            onClick={() =>
              dispatch(
                setExamsModalAdmissionNumber(solicitation?.admissionNumber)
              )
            }
            icon={<ExperimentOutlined />}
          >
            Exames
          </Button>
        </div>
      </PageHeader>

      <Row gutter={16}>
        <Col xs={18}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <RegulationStats />
            <RegulationPatient />
            <RegulationData />
            <RegulationSchedules />
            <RegulationAttachments idRegSolicitation={id} />
          </Space>
        </Col>
        <Col xs={24 - 18}>
          <RegulationHistory />
        </Col>
      </Row>

      <RegulationAction />
      <RegulationClinicalNotesModal />
      <ExamsModal />
    </>
  );
}
