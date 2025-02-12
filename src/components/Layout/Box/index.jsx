import "styled-components";
import React from "react";

import Heading from "components/Heading";
import { useTranslation } from "react-i18next";
import { Wrapper } from "./Box.style";

export default function Box({ renderHeader, children, pageTitle, ...props }) {
  const { t } = useTranslation();
  return (
    <Wrapper>
      {renderHeader
        ? renderHeader({ ...props, pageTitle, t })
        : pageTitle && (
            <header css="margin-bottom: 30px;">
              <Heading>{t(pageTitle)}</Heading>
            </header>
          )}

      {children}
    </Wrapper>
  );
}
