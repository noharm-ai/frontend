import withLayout from '@lib/withLayout';
import Segments from '@containers/Segments';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'menu.segments'
};

export default withLayout(Segments, layoutProps);
