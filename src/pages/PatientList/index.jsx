import withLayout from "lib/withLayout";
import PatientList from "containers/PatientList";

const layoutProps = {};

const PatientListWithLayout = withLayout(PatientList, layoutProps);

export default PatientListWithLayout;
