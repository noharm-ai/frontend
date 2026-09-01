import { useEffect, useState } from "react";

import Alert from "components/Alert";
import Button from "components/Button";
import DefaultModal from "components/Modal";
import { formatDateTime } from "utils/date";
import { useAppDispatch, useAppSelector } from "src/store";

import { getIntegrationErrors } from "../PrescriptionSlice";
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
 * The release is only sent after a check, so the errors are only fetched once
 * the prescription is checked. Checking again re-sends the release: the status
 * is part of the effect key so the alert never lingers after a new check.
 *
 * An aggregated prescription is released one internal prescription at a time,
 * so the ids already listed in `headers` are sent along and inspected together.
 *
 * The backend only reports errors that are still pending: an error followed by
 * a new check was already retried and is not listed.
 */
export function IntegrationErrorAlert() {
  const dispatch = useAppDispatch();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const idPrescription = useAppSelector(
    (state: any) => state.prescriptions.single.data?.idPrescription,
  );
  const status = useAppSelector(
    (state: any) => state.prescriptions.single.data?.status,
  );
  const headers = useAppSelector(
    (state: any) => state.prescriptions.single.data?.headers,
  );
  const errors: IntegrationError[] = useAppSelector(
    (state: any) => state.prescriptionv2.integrationErrors.list,
  );

  // headers is an object keyed by id on agg prescriptions, an empty array otherwise
  const aggIds = Object.keys(headers ?? {});
  const idPrescriptionList = aggIds.join(",");
  // re-checking a single prescription from the agg page re-sends its release
  // without moving the agg status, so the internal ones invalidate the list too
  const aggStatuses = aggIds.map((id) => headers[id]?.status).join(",");

  useEffect(() => {
    if (!idPrescription || status !== "s") {
      return;
    }

    dispatch(
      (getIntegrationErrors as any)({ idPrescription, idPrescriptionList }),
    );
  }, [dispatch, idPrescription, status, idPrescriptionList, aggStatuses]);

  if (status !== "s" || errors.length === 0) {
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
