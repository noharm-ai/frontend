import React, { useState } from "react";
import {
  AppstoreOutlined,
  BarsOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Avatar } from "antd";
import { useDispatch, useSelector } from "react-redux";

import { PageHeader } from "styles/PageHeader.style";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import { setSegment } from "./SegmentSlice";
import DepartmentsForm from "./Departments/Departments";
import OutliersForm from "./Outlier/Outlier";

//todo tornar geral
import { IntegrationContainer } from "../Integration/Integration.style";

export default function AdminSegment() {
  const dispatch = useDispatch();
  const segments = useSelector((state) => state.segments.list);
  const [departmentsModal, setDepartmentsModal] = useState(false);
  const [outliersModal, setOutliersModal] = useState(false);

  const showDepartments = (segment) => {
    dispatch(setSegment(segment));
    setDepartmentsModal(true);
  };

  const showOutliers = (segment) => {
    dispatch(setSegment(segment));
    setOutliersModal(true);
  };

  const getActions = (s) => {
    const actions = [];
    actions.push(
      <Tooltip title="Definir Setores">
        <Button
          shape="circle"
          icon={<BarsOutlined />}
          size="large"
          onClick={() => showDepartments(s)}
        ></Button>
      </Tooltip>
    );

    actions.push(
      <Tooltip title="Gerar Escores">
        <Button
          shape="circle"
          icon={<RobotOutlined />}
          size="large"
          onClick={() => showOutliers(s)}
        ></Button>
      </Tooltip>
    );

    return actions;
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Segmentos</h1>
          <h1 className="page-header-legend">Administração de Segmentos</h1>
        </div>
        <div className="page-header-actions"></div>
      </PageHeader>

      <IntegrationContainer>
        <Row gutter={[16, 24]}>
          {segments.map((s) => (
            <Col
              xs={{ span: 24 }}
              lg={{ span: 8 }}
              xxl={{ span: 6 }}
              key={s.id}
            >
              <Card className={`process-card`} actions={getActions(s)}>
                <Card.Meta
                  avatar={
                    <Avatar
                      icon={<AppstoreOutlined />}
                      style={{ backgroundColor: "#a991d6", color: "#fff" }}
                    />
                  }
                  title={s.description}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </IntegrationContainer>
      <DepartmentsForm open={departmentsModal} setOpen={setDepartmentsModal} />
      <OutliersForm open={outliersModal} setOpen={setOutliersModal} />
    </>
  );
}
