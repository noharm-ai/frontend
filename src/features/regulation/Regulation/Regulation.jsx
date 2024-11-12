import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Skeleton, Row, Col, Space } from "antd";

import Empty from "components/Empty";
import notification from "components/notification";
import RegulationStats from "./RegulationStats/RegulationStats";
import RegulationHistory from "./RegulationHistory/RegulationHistory";
import RegulationPatient from "./RegulationPatient/RegulationPatient";
import RegulationData from "./RegulationData/RegulationData";
import { fetchRegulation, reset } from "./RegulationSlice";

import { PageHeader } from "styles/PageHeader.style";

export default function Regulation() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.regulation.regulation.status);

  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    dispatch(fetchRegulation({ id })).then((response) => {
      if (response.error) {
        notification.error({ message: "Solicitação não encontrada" });
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
          <h1 className="page-header-title">Regulação nº: {id}</h1>
        </div>
        <div className="page-header-actions"></div>
      </PageHeader>

      <Row gutter={16}>
        <Col xs={18}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <RegulationStats />
            <RegulationPatient />
            <RegulationData />
          </Space>
        </Col>
        <Col xs={24 - 18}>
          <RegulationHistory />
        </Col>
      </Row>
    </>
  );
}