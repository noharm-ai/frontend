import React, { useEffect } from "react";
import { Route } from "react-router-dom";
import nprogress from "nprogress";
import { createGlobalStyle } from "styled-components/macro";

import { get } from "styles/utils";

const NProgressStyles = createGlobalStyle`
  #nprogress {
    pointer-events: none;
  }

  #nprogress .bar {
    background: ${get("colors.primary")};
    height: 2px;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 5;
  }

  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow:
      0 0 10px ${get("colors.primary")},
      0 0 5px ${get("colors.primary")};
    opacity: 1.0;
    transform: rotate(3deg) translate(0px, -4px);
  }
`;

export default function FancyRoute(props) {
  // componentWillMount
  nprogress.start();

  // componentDidMount
  useEffect(() => {
    nprogress.done();
  });

  return (
    <>
      <NProgressStyles />
      <Route {...props} />
    </>
  );
}
