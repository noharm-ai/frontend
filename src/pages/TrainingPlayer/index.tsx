import withLayout from "src/lib/withLayout";
import { TrainingPlayer } from "features/training/TrainingPlayer";

const layoutProps = {};

const TrainingPlayerWithLayout = withLayout(TrainingPlayer, layoutProps);

export default TrainingPlayerWithLayout;
