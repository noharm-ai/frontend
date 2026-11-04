import styled from "styled-components";

export const ParamsRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h4 {
    margin: 0;
  }

  .custom-value {
    font-weight: 600;
  }

  pre {
    margin: 0;
    font-size: 12px;
    white-space: pre-wrap;
  }
`;

export const Schema = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

export const Muted = styled.span`
  color: #8c94a6;
  font-style: italic;
`;

export const Footer = styled.div`
  color: #595959;
`;
