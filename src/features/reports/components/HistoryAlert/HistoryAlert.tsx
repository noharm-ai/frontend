import dayjs from "dayjs";
import { Alert } from "antd";

import Button from "components/Button";
import { formatDate } from "utils/date";

interface ContentProps {
  activeReport: string;
  reportDate?: string | null;
}

const Content = ({ activeReport, reportDate }: ContentProps) => (
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

interface HistoryAlertProps extends ContentProps {
  loadArchive: (filename: string) => void;
}

export function HistoryAlert({
  activeReport,
  loadArchive,
  reportDate,
}: HistoryAlertProps) {
  if (activeReport === "current") {
    return null;
  }

  return (
    <Alert
      message={`Histórico: ${dayjs(activeReport)
        .subtract(1, "day")
        .format("MM/YYYY")}`}
      description={
        <Content activeReport={activeReport} reportDate={reportDate} />
      }
      action={
        <Button onClick={() => loadArchive("current")}>
          Voltar ao relatório atual
        </Button>
      }
      showIcon
    />
  );
}
