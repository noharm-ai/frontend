import React from 'react';

import withLayout from '@lib/withLayout';
import ScreeningList from '@containers/ScreeningList';
import PageHeader from '@containers/ScreeningList/PageHeader';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'menu.prioritization',
  renderHeader: props => <PageHeader {...props} />
};

export default withLayout(ScreeningList, layoutProps);
