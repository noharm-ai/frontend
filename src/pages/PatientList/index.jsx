import withLayout from '@lib/withLayout';
import PatientList from '@containers/PatientList';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'menu.patients'
};

export default withLayout(PatientList, layoutProps);
