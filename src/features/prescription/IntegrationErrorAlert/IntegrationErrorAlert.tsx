import { useState } from "react";

import Alert from "components/Alert";
import Button from "components/Button";
import DefaultModal from "components/Modal";
import { formatDateTime } from "utils/date";
import { useAppSelector } from "src/store";

import { IntegrationErrorList } from "./IntegrationErrorAlert.style";

interface IntegrationError {
  idPrescription: string;
  date: string;
  message: string | null;
  extra: Record<string, unknown> | null;
}

/**
 * Warns that the checked prescription was not confirmed by the origin system.
 *
 * The backend only reports errors that are still pending: an error followed by
 * a new check was already retried and is not listed.
 */
export function IntegrationErrorAlert() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const errors: IntegrationError[] = useAppSelector(
    (state: any) => state.prescriptions.single.data?.integrationErrors ?? [],
  );

  if (errors.length === 0) {
    return null;
  }

  return (
    <>
      <Alert
        type="error"
        showIcon
        style={{ marginBottom: "20px" }}
        message="Falha no envio da checagem ao sistema de origem"
        description={
          <>
            <p style={{ marginTop: 0 }}>
              {errors.length === 1
                ? "A checagem desta prescrição não foi recebida pelo sistema de origem, portanto os itens podem não ter sido liberados para administração."
                : `${errors.length} checagens não foram recebidas pelo sistema de origem, portanto os itens podem não ter sido liberados para administração.`}
            </p>
            <Button danger onClick={() => setDetailsOpen(true)}>
              Ver detalhes
            </Button>
          </>
        }
      />

      <DefaultModal
        title="Falha no envio da checagem ao sistema de origem"
        open={detailsOpen}
        onCancel={() => setDetailsOpen(false)}
        okText="Fechar"
        okButtonProps={{ type: "default" }}
        cancelButtonProps={{ style: { display: "none" } }}
        onOk={() => setDetailsOpen(false)}
        width={600}
        wrapClassName="default-modal"
      >
        <IntegrationErrorList>
          {errors.map((error) => (
            <li key={`${error.idPrescription}-${error.date}`}>
              <div className="integration-error-header">
                <strong>Prescrição {error.idPrescription}</strong>
                <span>{formatDateTime(error.date)}</span>
              </div>
              {error.message && (
                <div className="integration-error-message">{error.message}</div>
              )}
              {error.extra && <pre>{JSON.stringify(error.extra, null, 2)}</pre>}
            </li>
          ))}
        </IntegrationErrorList>
      </DefaultModal>
    </>
  );
}
