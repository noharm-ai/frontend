import { useEffect, useSyncExternalStore } from "react";
import { Spin, Tooltip, Typography } from "antd";

import { PatientNameStore } from "../patientNames/patientNameStore";
import { isEmptyId } from "../patientNames/patientNames.utils";

interface PatientNameCellProps {
  store: PatientNameStore;
  idPatient: unknown;
}

/**
 * Patient name of a report row. Rendering the cell is what requests the name:
 * the report table is virtual, so only the rows on screen ask for one.
 */
export function PatientNameCell({ store, idPatient }: PatientNameCellProps) {
  const hasId = !isEmptyId(idPatient);
  const id = hasId ? (idPatient as string | number) : "";

  const status = useSyncExternalStore(store.subscribe, () =>
    hasId ? store.getStatus(id) : "idle",
  );
  const name = useSyncExternalStore(store.subscribe, () =>
    hasId ? store.getName(id) : undefined,
  );

  useEffect(() => {
    if (!hasId) return;
    return store.watch(id);
  }, [store, id, hasId]);

  if (!hasId) return null;

  if (status === "loaded" && name) {
    return <span title={name}>{name}</span>;
  }

  if (status === "missing") {
    return <Typography.Text type="secondary">Não encontrado</Typography.Text>;
  }

  if (status === "error") {
    return (
      <Tooltip title="Não foi possível buscar o nome. Ele será buscado de novo quando a linha voltar à tela.">
        <Typography.Text type="warning">Erro ao buscar</Typography.Text>
      </Tooltip>
    );
  }

  return <Spin size="small" />;
}
