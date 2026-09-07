import { createGlobalStyle } from "styled-components";
import { rgba } from "polished";

import { get } from "styles/utils";
import { loadingCircle } from "styles/mixins";

const ResetStyled = createGlobalStyle`
  :root {
    font-size: 100%;
  }

  html {
    line-height: 1.15; /* 1 */
    -webkit-text-size-adjust: 100%; /* 2 */
  }

  body {
    color: ${get("colors.text")};
    font-size: ${get("sizes.defaultFontSize")};
    font-weight: ${get("weight.regular")};
    font-variant-numeric: tabular-nums;
    margin: 0;
  }

  main {
    display: block;
  }

  h1 {
    font-size: 2em;
    margin: 0.67em 0;
  }

  hr {
    box-sizing: content-box; /* 1 */
    height: 0; /* 1 */
    overflow: visible; /* 2 */
  }

  pre {
    font-family: monospace, monospace; /* 1 */
    font-size: 1em; /* 2 */
  }

  a {
    background-color: transparent;
  }

  abbr[title] {
    border-bottom: none; /* 1 */
    text-decoration: underline; /* 2 */
    text-decoration: underline dotted; /* 2 */
  }

  b,
  strong {
    font-weight: bolder;
  }

  code,
  kbd,
  samp {
    font-family: monospace, monospace; /* 1 */
    font-size: 1em; /* 2 */
  }

  small {
    font-size: 80%;
  }

  sub,
  sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }

  sub {
    bottom: -0.25em;
  }

  sup {
    top: -0.5em;
  }

  img {
    border-style: none;
  }

  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
  }

  button,
  input {
    overflow: visible;
  }

  button,
  select { /* 1 */
    text-transform: none;
  }

  button,
  [type="button"],
  [type="reset"],
  [type="submit"] {
    -webkit-appearance: button;
  }

  button::-moz-focus-inner,
  [type="button"]::-moz-focus-inner,
  [type="reset"]::-moz-focus-inner,
  [type="submit"]::-moz-focus-inner {
    border-style: none;
    padding: 0;
  }

  button:-moz-focusring,
  [type="button"]:-moz-focusring,
  [type="reset"]:-moz-focusring,
  [type="submit"]:-moz-focusring {
    outline: 1px dotted ButtonText;
  }

  fieldset {
    padding: 0.35em 0.75em 0.625em;
  }

  legend {
    box-sizing: border-box;
    color: inherit;
    display: table;
    max-width: 100%;
    padding: 0;
    white-space: normal;
  }

  progress {
    vertical-align: baseline;
  }

  textarea {
    overflow: auto;
  }

  [type="checkbox"],
  [type="radio"] {
    box-sizing: border-box; /* 1 */
    padding: 0; /* 2 */
  }

  [type="number"]::-webkit-inner-spin-button,
  [type="number"]::-webkit-outer-spin-button {
    height: auto;
  }

  [type="search"] {
    -webkit-appearance: textfield; /* 1 */
    outline-offset: -2px; /* 2 */
  }

  [type="search"]::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-file-upload-button {
    -webkit-appearance: button; /* 1 */
    font: inherit; /* 2 */
  }

  details {
    display: block;
  }

  summary {
    display: list-item;
  }

  template {
    display: none;
  }

  [hidden] {
    display: none;
  }

  * {
    box-sizing: border-box;
  }

  .anticon > * {
    line-height: 1;
  }

  .anticon-loading {
    position: relative;
  }

  .anticon-spin {
    display: inline-block;
    animation: ${loadingCircle} 1s infinite linear;
  }

  .anticon svg {
    display: inline-block;
  }

  .anticon {
    color: inherit;
    font-style: normal;
    line-height: 0;
    text-align: center;
    text-transform: none;
    vertical-align: -0.125em;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .ant-select-dropdown-menu-item-active:not(.ant-select-dropdown-menu-item-disabled),
  .ant-select-dropdown-menu-item:hover:not(.ant-select-dropdown-menu-item-disabled) {
    background-color: ${rgba("#70bdc3", 0.2)} !important;
  }

  .ant-spin-dot-item {
    background-color: #2e3c5a;
  }

  .bg-light-gray {
    background: rgba(244, 244, 244, 0.5) !important;
  }

  .ant-menu-inline-collapsed-tooltip a {
    text-decoration: none;
  }

  .default-modal {
    .ant-modal-confirm-content {
      max-width: none !important;
    }
  }

  .iframe-modal {
    .ant-modal-confirm-content {
      max-width: none !important;
      width: 100%;
    }
  }

  /* antd >= 6.3 sets font-size/line-height on the Spin wrapper element
     (previously the unstyled .ant-spin-nested-loading), which our nested
     page content would inherit instead of the app's own typography. */
  .ant-spin.ant-spin:has(> .ant-spin-container) {
    font-size: inherit;
    line-height: inherit;
  }

  /* antd >= 6.3 lays the collapsed sider menu items out with flexbox, which
     centers each icon 1px lower than the previous inline layout. */
  .ant-menu-inline-collapsed > .ant-menu-item .ant-menu-item-icon,
  .ant-menu-inline-collapsed
    > .ant-menu-submenu
    > .ant-menu-submenu-title
    .ant-menu-item-icon {
    position: relative;
    top: -1px;
  }

  /* antd >= 6.3 renders button icons as centered inline-flex and inserts an
     \\00a0 ::before strut inside the icon, which redefines the icon baseline
     and nudges every in-button icon glyph a few pixels. Restore the previous
     rendering. */
  .ant-btn .ant-btn-icon.ant-btn-icon {
    display: inline;

    .anticon {
      vertical-align: -0.125em;

      &::before {
        display: none;
      }
    }
  }
`;

export default ResetStyled;
