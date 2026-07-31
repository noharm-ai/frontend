import { useState } from "react";
import { useTranslation } from "react-i18next";

import api from "services/api";
import notification from "components/notification";
import type { IPrescriptionTrace } from "components/Screening/Patient/Card/ProtocolTrace/types";
import { getErrorMessageFromException } from "utils/errorHandler";

import { IProtocolFormBaseFields } from "../Form/types";
import { ITestResultRow } from "./types";

export function useProtocolTestDetail(protocol: IProtocolFormBaseFields) {
  const { t } = useTranslation();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailTrace, setDetailTrace] = useState<IPrescriptionTrace | null>(
    null,
  );

  const openDetail = async (row: ITestResultRow) => {
    setDetailId(row.idPrescription);
    try {
      const response = await api.protocols.testConfig({
        config: protocol.config,
        protocolType: protocol.protocolType,
        idPrescriptionList: [row.idPrescription],
        detailed: true,
        name: protocol.name || undefined,
      });
      const result: ITestResultRow = response.data.data.results[0];
      if (result?.trace) {
        setDetailTrace(result.trace);
      } else if (result?.error) {
        notification.error({ message: result.error });
      }
    } catch (error: any) {
      notification.error({
        message: getErrorMessageFromException(error?.response?.data, t),
      });
    }
    setDetailId(null);
  };

  const closeDetail = () => setDetailTrace(null);

  return { detailId, detailTrace, openDetail, closeDetail };
}
