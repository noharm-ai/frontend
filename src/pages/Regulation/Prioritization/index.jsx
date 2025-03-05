import withLayout from "lib/withLayout";
import Prioritization from "features/regulation/Prioritization/Prioritization";
import { RegulationForm } from "features/regulation/RegulationForm/RegulationForm";
import RegulationMultipleAction from "features/regulation/Prioritization/RegulationMultipleAction/RegulationMultipleAction";

const layoutProps = {};

const Page = () => (
  <>
    <Prioritization />
    <RegulationForm />
    <RegulationMultipleAction />
  </>
);

const PrioritizationWithLayout = withLayout(Page, layoutProps);

export default PrioritizationWithLayout;
