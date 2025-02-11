import React from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { ExportOutlined, QuestionCircleOutlined } from "@ant-design/icons";

import Heading from "components/Heading";
import Modal from "components/Modal";
import Button from "components/Button";
import Alert from "components/Alert";

import { setHelpModal } from "../EconomyReportSlice";

export default function HelpModal() {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.reportsArea.economy.helpModal);
  const updatedAt = useSelector((state) => state.reportsArea.economy.updatedAt);

  return (
    <Modal
      open={open}
      width={500}
      onCancel={() => dispatch(setHelpModal(false))}
      footer={null}
    >
      <Heading
        $size="18px"
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
        Este relatório apresenta a economia calculada com base nas intervenções
        aplicadas.
      </p>
      <p>
        O período disponibilizado para consulta é:{" "}
        <strong>
          {dayjs(updatedAt).subtract(1, "year").format("DD/MM/YY")}
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
              `${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/192`
            )
          }
        >
          Base de Conhecimento
        </Button>
      </p>
    </Modal>
  );
}
