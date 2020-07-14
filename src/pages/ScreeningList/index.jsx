import withLayout from '@lib/withLayout';
import ScreeningList from '@containers/ScreeningList';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'Priorização de Prescrições'
};

export default withLayout(ScreeningList, layoutProps);
