import withLayout from '@lib/withLayout';
import ScreeningList from '@containers/ScreeningList';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'Pacientes para Triagem'
};

export default withLayout(ScreeningList, layoutProps);
