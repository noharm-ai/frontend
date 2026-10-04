import styled from "styled-components";

export const Details = styled.div`
  font-size: 13px;
  max-width: 340px;

  .details-title {
    font-size: 14px;
    font-weight: 600;
  }

  .details-subtitle {
    opacity: 0.8;
  }

  dl {
    margin: 8px 0 0 0;
  }

  dt {
    font-size: 11px;
    margin-top: 6px;
    opacity: 0.7;
    text-transform: uppercase;
  }

  dd {
    margin: 0;
  }

  ul {
    margin: 0;
    padding-left: 16px;
  }

  .regimen-date {
    opacity: 0.7;
  }

  .details-gaps {
    font-style: italic;
    margin-top: 8px;
  }
`;
