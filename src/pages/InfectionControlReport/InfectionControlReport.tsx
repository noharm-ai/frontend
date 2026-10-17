import withLayout from "src/lib/withLayout";
import { InfectionControlReportPage as InfectionControlReport } from "features/infectionControl/InfectionControlReportPage/InfectionControlReportPage";

export const InfectionControlReportPage = withLayout(InfectionControlReport, {
  pageTitle: "Relatório de Controle de Infecção",
  defaultSelectedKeys: "/",
});
