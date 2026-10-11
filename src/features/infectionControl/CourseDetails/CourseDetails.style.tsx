import styled from "styled-components";

export const Details = styled.div`
  color: #2e3c5a;

  header {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 12px;
    padding-right: 24px;
  }

  .details-title {
    align-items: center;
    display: flex;
    gap: 8px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
  }

  .details-subtitle {
    align-items: center;
    color: #8c8c8c;
    display: flex;
    gap: 8px;
    margin-top: 6px;

    .ant-tag {
      margin: 0;
    }
  }

  .details-summary {
    display: grid;
    gap: 12px 24px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 16px 0 0 0;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    dt {
      color: #8c8c8c;
      font-size: 12px;
    }

    dd {
      font-weight: 500;
      margin: 0;
    }
  }

  section {
    margin-top: 20px;
  }

  h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .details-count {
    color: #8c8c8c;
    font-weight: 400;
  }

  .regimen-current {
    margin-left: 6px;
  }

  .regimen-row-current > td {
    background: #f0f7fc;
  }
`;
