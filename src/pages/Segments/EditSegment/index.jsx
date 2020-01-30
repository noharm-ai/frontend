import withLayout from '@lib/withLayout';
import EditSegment from '@containers/Segments/EditSegment';

const layoutProps = {
  theme: 'boxed',
  defaultSelectedKeys: '/segmentos',
  pageTitle: 'Editar Segmento'
};

export default withLayout(EditSegment, layoutProps);
