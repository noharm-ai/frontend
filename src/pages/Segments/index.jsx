import withLayout from '@lib/withLayout';
import Segments from '@containers/Segments';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'menu.exams'
};

export default withLayout(Segments, layoutProps);
