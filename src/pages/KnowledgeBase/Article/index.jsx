import React from 'react';

import withLayout from '@lib/withLayout';
import ViewReport from '@containers/KnowledgeBase/Article';
import PageHeader from './PageHeader';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'menu.knowledgeBase',
  defaultSelectedKeys: '/base-de-conhecimento',
  renderHeader: props => <PageHeader {...props} />
};

export default withLayout(ViewReport, layoutProps);
