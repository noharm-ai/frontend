import styled from "styled-components";

export const IntegrationErrorList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    margin-bottom: 10px;
    padding: 10px;
  }

  .integration-error-header {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .integration-error-message {
    margin-top: 5px;
    word-break: break-word;
  }

  pre {
    background: #f5f5f5;
    margin: 10px 0 0;
    max-height: 200px;
    overflow: auto;
    padding: 5px;
  }
`;
