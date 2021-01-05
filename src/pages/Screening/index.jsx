import withLayout from '@lib/withLayout';
import Screening from '@containers/Screening';

const layoutProps = {
  pageTitle: 'Prescrição',
  defaultSelectedKeys: '/'
};

export default withLayout(Screening, layoutProps);
