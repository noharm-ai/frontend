import "styled-components/macro";
import React from "react";
import PropTypes from "prop-types";

import Heading from "components/Heading";
import { useTranslation } from "react-i18next";
import { Wrapper } from "./Box.style";

export default function Box({ renderHeader, children, pageTitle, ...props }) {
  const { t } = useTranslation();
  return (
    <Wrapper>
      {renderHeader ? (
        renderHeader({ ...props, pageTitle, t })
      ) : (
        <header css="margin-bottom: 30px;">
          <Heading>{t(pageTitle)}</Heading>
        </header>
      )}

      {children}
    </Wrapper>
  );
}

Box.propTypes = {
  renderHeader: PropTypes.func,
  pageTitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

Box.defaultProps = {
  renderHeader: null,
};
