import React from "react";
import dayjs from "dayjs";
import { Alert } from "antd";

import Button from "components/Button";

export default function HistoryAlert({ activeReport, loadArchive }) {
  if (activeReport === "current") {
    return null;
  }
  return (
    <Alert
      message={`Histórico: ${dayjs(activeReport)
        .subtract(1, "day")
        .format("MM/YYYY")}`}
      description={`Você está visualizando o relatório consolidado do mês de ${dayjs(
        activeReport
      )
        .subtract(1, "day")
        .format("MMMM/YY")}.`}
      action={
        <Button onClick={() => loadArchive("current")}>
          Voltar ao relatório atual
        </Button>
      }
      showIcon
    />
  );
}
