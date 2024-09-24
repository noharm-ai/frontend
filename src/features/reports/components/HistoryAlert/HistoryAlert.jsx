import React from "react";
import dayjs from "dayjs";
import { Alert } from "antd";

import Button from "components/Button";
import { formatDate } from "utils/date";

export default function HistoryAlert({
  activeReport,
  loadArchive,
  reportDate,
}) {
  if (activeReport === "current") {
    return null;
  }

  const Content = () => (
    <>
      <div>
        Você está visualizando o relatório consolidado do mês de{" "}
        {dayjs(activeReport).subtract(1, "day").format("MMMM/YY")}.
      </div>
      <div>
        Estes dados representam uma foto tirada em {formatDate(reportDate)}.
        Atualizações nos dados após esta data não são consideradas neste
        relatório.
      </div>
    </>
  );

  return (
    <Alert
      message={`Histórico: ${dayjs(activeReport)
        .subtract(1, "day")
        .format("MM/YYYY")}`}
      description={<Content />}
      action={
        <Button onClick={() => loadArchive("current")}>
          Voltar ao relatório atual
        </Button>
      }
      showIcon
    />
  );
}
