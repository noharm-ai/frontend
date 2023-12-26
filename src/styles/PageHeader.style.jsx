import styled from "styled-components/macro";

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;

  .page-header-title {
    display: flex;
    align-items: center;
    color: #2e3c5a;
    font-size: 30px;
    font-weight: 600;
    margin: 0;
    text-align: left;

    .ant-btn {
      margin-left: 1rem;
    }
  }

  .page-header-legend {
    color: #2e3c5a;
    display: block;
    font-size: 0.875rem;
    font-weight: 400;
    margin: 3px 0 0 0;
    text-align: left;
  }

  .page-header-actions {
    > * {
      margin-left: 15px;
    }
  }
`;

export const ExtraFilters = styled.div`
  .filter-field {
    display: inline-block;
    margin-right: 10px;

    label {
      display: block;
      margin-bottom: 2px;
      color: #2e3c5a;
    }
  }

  .obs {
    padding-top: 5px;
    font-size: 13px;
  }
`;
