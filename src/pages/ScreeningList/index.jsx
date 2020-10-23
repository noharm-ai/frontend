import React from 'react';

import withLayout from '@lib/withLayout';
import ScreeningList from '@containers/ScreeningList';
import Heading from '@components/Heading';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'menu.prioritization',
  renderHeader: ({ prioritizationType, t }) => {
    const title = `screeningList.title-${prioritizationType}`;

    return (
      <header style={{ marginBottom: '30px' }}>
        <Heading>{t(title)}</Heading>
      </header>
    );
  }
};

export default withLayout(ScreeningList, layoutProps);
