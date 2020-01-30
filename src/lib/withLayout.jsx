import React from 'react';

import Layout from '@containers/Layout';

export default (Component, layoutProps = {}) => (props = {}) => (
  <Layout {...layoutProps} {...props}>
    <Component {...props} />
  </Layout>
);
