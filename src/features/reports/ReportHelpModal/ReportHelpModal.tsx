import type { ReactNode } from "react";
import dayjs from "dayjs";
import { ExportOutlined, QuestionCircleOutlined } from "@ant-design/icons";

import { useAppSelector } from "src/store";
import Heading from "components/Heading";
import Modal from "components/Modal";
import Button from "components/Button";
import Alert from "components/Alert";
import { useArticleModal } from "features/knowledgeBase/useArticleModal";

/** The cached reports that share this help modal (keys of `reportsArea`). */
export type ReportHelpArea =
  | "economy"
  | "intervention"
  | "patientDay"
  | "prescription"
  | "prescriptionAudit";

interface ReportHelpModalProps {
  area: ReportHelpArea;
  /** What the report shows, under the "updated at" notice. */
  description: ReactNode;
  /** Knowledge base article opened by "Base de Conhecimento". */
  articleId: number;
  onClose: () => void;
}

/**
 * Help modal of a cached report: when the file was updated, the period it
 * covers and a link to the report's knowledge base article.
 */
export function ReportHelpModal({
  area,
  description,
  articleId,
  onClose,
}: ReportHelpModalProps) {
  const { openArticle } = useArticleModal();
  const open = useAppSelector((state) => state.reportsArea[area].helpModal);
  const updatedAt = useAppSelector(
    (state) => state.reportsArea[area].updatedAt,
  );
  const dateRange = useAppSelector(
    (state) => state.reportsArea[area].dateRange,
  );
  const reportDate = useAppSelector((state) => state.reportsArea[area].date);

  return (
    <Modal open={open} width={500} onCancel={onClose} footer={null}>
      <div data-kb={`reports.${area}.help`}>
        <Heading
          $size="18px"
          className="fixed"
          style={{
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
          }}
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
        <p>{description}</p>
        <p>
          O período disponibilizado para consulta é:{" "}
          <strong>
            {/* dayjs coerces a null range to 0, so keep that explicit */}
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
          Para informações mais detalhadas sobre este relatório, acesse a base
          de conhecimento através do botão abaixo:
          <Button
            type="default"
            icon={<ExportOutlined />}
            size="large"
            style={{ marginTop: "10px" }}
            block
            onClick={() => openArticle(articleId)}
          >
            Base de Conhecimento
          </Button>
        </p>
      </div>
    </Modal>
  );
}
