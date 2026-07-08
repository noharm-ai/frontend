import withLayout from "src/lib/withLayout";
import { TrainingCentral } from "features/training/TrainingCentral";

const layoutProps = {};

const TrainingCentralWithLayout = withLayout(TrainingCentral, layoutProps);

export default TrainingCentralWithLayout;
