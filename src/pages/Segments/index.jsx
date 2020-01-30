import React from 'react';

import withLayout from '@lib/withLayout';
import Segments from '@containers/Segments';
import PageHeader from './PageHeader';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'Segmentos',
  renderHeader: props => <PageHeader {...props} />
};

export default withLayout(Segments, layoutProps);
