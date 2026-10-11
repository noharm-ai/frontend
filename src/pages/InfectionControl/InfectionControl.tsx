import withLayout from "src/lib/withLayout";
import { InfectionControl } from "features/infectionControl/InfectionControl/InfectionControl";

export const InfectionControlPage = withLayout(InfectionControl, {
  pageTitle: "Controle de Infecção",
  defaultSelectedKeys: "/",
});
