import 'styled-components/macro';
import React from 'react';
import PropTypes from 'prop-types';

import Heading from '@components/Heading';
import { Wrapper } from './Box.style';

export default function Box({ renderHeader, children, pageTitle, ...props }) {
  return (
    <Wrapper>
      {renderHeader ? (
        renderHeader({ ...props, pageTitle })
      ) : (
        <header css="margin-bottom: 30px;">
          <Heading>{pageTitle}</Heading>
        </header>
      )}

      {children}
    </Wrapper>
  );
}

Box.propTypes = {
  renderHeader: PropTypes.func,
  pageTitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

Box.defaultProps = {
  renderHeader: null
};
