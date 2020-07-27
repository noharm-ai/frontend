import withLayout from '@lib/withLayout';
import ScreeningList from '@containers/ScreeningList';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'menu.prioritization'
};

export default withLayout(ScreeningList, layoutProps);
