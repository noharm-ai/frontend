import React from "react";

import Layout from "containers/Layout";

const withLayout =
  (Component, layoutProps = {}) =>
  (props = {}) =>
    (
      <Layout {...layoutProps} {...props}>
        <Component {...props} />
      </Layout>
    );

export default withLayout;
