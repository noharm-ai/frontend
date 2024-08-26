import React from "react";
import { useSelector } from "react-redux";
import { Row, Col, Empty, Divider } from "antd";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";

import DefaultModal from "components/Modal";
import Heading from "components/Heading";
import Tooltip from "components/Tooltip";

import { DiffContainer } from "./PrescriptionDiff.style";

export default function PrescriptionDiff({ open, setOpen }) {
  const addList = useSelector(
    (state) => state.prescriptions.single.data.prescriptionCompare.addList
  );
  const removeList = useSelector(
    (state) => state.prescriptions.single.data.prescriptionCompare.removeList
  );
  const maxDate = useSelector(
    (state) => state.prescriptions.single.data.prescriptionCompare.maxDate
  );

  return (
    <DefaultModal
      open={open}
      width={950}
      centered
      destroyOnClose
      onCancel={() => setOpen(false)}
      footer={null}
    >
      <Heading margin="0 0 11px" style={{ fontSize: "1.2rem" }}>
        Comparativo de Vigências (Beta)
      </Heading>

      <p>
        Itens removidos/adicionados na vigência{" "}
        <strong>{maxDate.split("-").reverse().join("/")}</strong> comparada com
        a vigência imediatamente anterior. <br />A relação abaixo{" "}
        <strong>não considera</strong> diferenças de dose e/ou frequência.
      </p>

      <Row gutter={[24, 24]} style={{ marginTop: "2rem" }}>
        <Col xs={11}>
          <Heading margin="0 0 11px" style={{ fontSize: "1rem" }}>
            Itens removidos
          </Heading>

          {removeList.map((d) => (
            <Tooltip title={`Item removido`} key={d}>
              <DiffContainer className="minus">
                <MinusCircleOutlined /> <div>{d}</div>
              </DiffContainer>
            </Tooltip>
          ))}
          {removeList.length === 0 && <Empty description="0 itens removidos" />}
        </Col>
        <Col xs={1}>
          <Divider type="vertical" style={{ height: "100%" }} />
        </Col>
        <Col xs={11}>
          <Heading margin="0 0 11px" style={{ fontSize: "1rem" }}>
            Itens adicionados
          </Heading>
          {addList.map((d) => (
            <Tooltip title={`Item adicionado`} key={d}>
              <DiffContainer className="plus">
                <PlusCircleOutlined /> <div>{d}</div>
              </DiffContainer>
            </Tooltip>
          ))}
          {addList.length === 0 && <Empty description="0 itens adicionados" />}
        </Col>
      </Row>
      <p>*Esta funcionalidade está em fase de testes. Aceitamos sugestões.</p>
    </DefaultModal>
  );
}
