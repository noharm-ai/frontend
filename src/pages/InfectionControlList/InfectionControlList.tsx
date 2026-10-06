import withLayout from "src/lib/withLayout";
import { InfectionControlList } from "features/infectionControl/InfectionControlList/InfectionControlList";

export const InfectionControlListPage = withLayout(InfectionControlList, {
  pageTitle: "Controle de Infecção",
  defaultSelectedKeys: "/controle-infeccao",
});
