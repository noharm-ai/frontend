import withLayout from '@lib/withLayout';
import FormSegment from '@containers/Forms/Segment';

const layoutProps = {
  theme: 'boxed',
  defaultSelectedKeys: '/segmentos',
  pageTitle: 'Novo Segmento'
};

export default withLayout(FormSegment, layoutProps);
