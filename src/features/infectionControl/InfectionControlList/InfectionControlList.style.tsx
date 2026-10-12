import styled from "styled-components";

export const ListBox = styled.div`
  .muted {
    color: #8c8c8c;
    font-size: 12px;
  }

  .overdue {
    color: #cf1322;
    font-weight: 500;
  }

  .pendings {
    margin: 0;
    padding-left: 16px;
  }
`;

// the status buttons above the list, with how many patients each holds, as in
// the prescription prioritization
export const StatusFilter = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;

  .ant-tag {
    margin-left: 10px;
    margin-inline-end: 0;
  }

  button.active {
    background-color: #70bdc3;
    border-color: #70bdc3;
    color: #fff;

    &:hover {
      background-color: #70bdc3 !important;
      border-color: #70bdc3 !important;
      color: #fff !important;
    }
  }
`;
