import React from 'react';

import withLayout from '@lib/withLayout';
import Screening from '@containers/Screening';
import PageHeader from '@containers/Screening/PageHeader';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'Triagem',
  defaultSelectedKeys: '/',
  renderHeader: props => <PageHeader {...props} />
};

export default withLayout(Screening, layoutProps);
