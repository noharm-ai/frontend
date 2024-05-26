import React from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { ExportOutlined, QuestionCircleOutlined } from "@ant-design/icons";

import Heading from "components/Heading";
import Modal from "components/Modal";
import Button from "components/Button";
import Alert from "components/Alert";

import { setHelpModal } from "../PrescriptionReportSlice";

export default function HelpModal() {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.reportsArea.prescription.helpModal);
  const updatedAt = useSelector(
    (state) => state.reportsArea.prescription.updatedAt
  );

  return (
    <Modal
      open={open}
      width={500}
      onCancel={() => dispatch(setHelpModal(false))}
      footer={null}
    >
      <Heading
        size="18px"
        className="fixed"
        style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}
      >
        <QuestionCircleOutlined
          style={{ fontSize: "1.5rem", marginRight: "1rem" }}
        />{" "}
        Informações
      </Heading>

      <Alert
        message={`Atualizado em: ${dayjs(updatedAt).format("DD/MM/YY HH:mm")}`}
        type="info"
      />
      <p>
        Este relatório apresenta as métricas de avaliação de{" "}
        <strong>Prescrições</strong>.
      </p>
      <p>
        O período disponibilizado para consulta é:{" "}
        <strong>
          {dayjs(updatedAt).subtract(60, "day").format("DD/MM/YY")}
        </strong>{" "}
        até{" "}
        <strong>
          {dayjs(updatedAt).subtract(1, "day").format("DD/MM/YY")}
        </strong>
      </p>
      <p>
        Para informações mais detalhadas sobre este relatório, acesse a base de
        conhecimento através do botão abaixo:
        <Button
          type="default"
          icon={<ExportOutlined />}
          size="large"
          style={{ marginTop: "10px" }}
          block
          onClick={() =>
            window.open(
              `${process.env.REACT_APP_ODOO_LINK}/knowledge/article/140`,
              "_blank"
            )
          }
        >
          Base de Conhecimento
        </Button>
      </p>
    </Modal>
  );
}
