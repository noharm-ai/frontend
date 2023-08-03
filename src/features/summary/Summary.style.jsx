import styled from "styled-components/macro";

export const SummaryContainer = styled.div`
  display: flex;
  justify-content: center;
  font-size: 18px;

  > div:first-child {
    width: 1000px;
    margin-right: 4em;
  }

  .sub_level {
    position: relative;
    padding: 2em 0 1em 2em;
    margin-bottom: 3em;

    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 3px;
      height: 100%;
      background: #70bdc3;
    }

    .sub_level {
      &:before {
        width: 3px;
        background: #a991d6;
      }
    }
  }

  h2,
  h3,
  h4 {
    color: #2e3c5a;
  }

  h2 {
    text-transform: uppercase;
    font-size: 1.3em;
  }

  h3 {
    font-size: 1.2em;
  }

  h4 {
    font-size: 1em;
  }

  .ant-anchor-wrapper {
    padding: 2em 2em;
  }

  .ant-anchor-link-title {
    font-size: 16px;
  }

  .ant-anchor-ink:before {
    background-color: #70bdc3;
  }
`;

export const SummaryPanel = styled.div`
  position: relative;
  background: #fff;
  padding: 2em;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 -1px 7px rgb(0 0 0 / 16%);
  font-size: 18px;
  transition: all 0.5s linear;
  min-height: 4em;

  &.loading {
    display: flex;
    justify-content: center;
    min-height: 4em;
    align-items: center;
    opacity: 0.5;
  }

  &.edit {
    display: inline-grid;
    border-color: #70bdc3;
    box-shadow: 0 0 0 5px rgba(112, 189, 195, 0.4);

    &::after {
      content: attr(data-value) " ";
      visibility: hidden;
      white-space: pre-wrap;
      grid-area: 2/1;
    }
  }

  &.error {
    background: #f8dee2;
    border: 1px solid #f68c97;
    display: flex;
    justify-content: center;
  }

  .group {
    display: flex;

    > div {
      width: 50%;
    }
  }

  .attribute {
    display: flex;
    flex-direction: column;
    margin-bottom: 1em;

    label {
      font-size: 0.875em;
      font-weight: 600;
    }

    span {
      font-size: 1em;
    }
  }

  textarea {
    grid-area: 2/1;
    padding: 0;
    font-size: 1em;
    border: 0;
    outline: 0;
    resize: none;

    &:focus {
      border: 0 !important;
      box-shadow: none !important;
    }
  }

  .actions {
    position: absolute;
    bottom: -1em;
    right: 2em;

    button {
      margin-left: 0.5em;
    }
  }
`;
