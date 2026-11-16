import dayjs from "dayjs";
import { ExportOutlined, QuestionCircleOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import Heading from "components/Heading";
import Modal from "components/Modal";
import Button from "components/Button";
import Alert from "components/Alert";
import { useArticleModal } from "features/knowledgeBase/useArticleModal";

import { setHelpModal } from "../PrescriptionReportSlice";

export function HelpModal() {
  const dispatch = useAppDispatch();
  const { openArticle } = useArticleModal();
  const open = useAppSelector(
    (state) => state.reportsArea.prescription.helpModal,
  );
  const updatedAt = useAppSelector(
    (state) => state.reportsArea.prescription.updatedAt,
  );
  // The JS slice infers `null` from its initial state; it holds a number once loaded.
  const dateRange = useAppSelector(
    (state): number | null => state.reportsArea.prescription.dateRange,
  );
  const reportDate = useAppSelector(
    (state) => state.reportsArea.prescription.date,
  );

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
        Este relatório apresenta as métricas de avaliação de{" "}
        <strong>Prescrições</strong>.
      </p>
      <p>
        O período disponibilizado para consulta é:{" "}
        <strong>
          {dayjs(reportDate)
            .subtract(dateRange ?? 0, "day")
            .format("DD/MM/YY")}
        </strong>{" "}
        até{" "}
        <strong>
          {dayjs(reportDate).subtract(1, "day").format("DD/MM/YY")}
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
          onClick={() => openArticle(42)}
        >
          Base de Conhecimento
        </Button>
      </p>
    </Modal>
  );
}
