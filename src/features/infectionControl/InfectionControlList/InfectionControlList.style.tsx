import styled from "styled-components";

export const ListBox = styled.div`
  .limit-alert {
    margin-bottom: 15px;
  }

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

// the search and how many patients are listed, above the list, as in the
// prescription prioritization
export const ListInfo = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;

  .ant-input-affix-wrapper.active {
    border-color: #096dd9;
    background-color: #eee;

    input {
      background-color: #eee;
    }
  }

  .list-count .ant-tag {
    margin-left: 10px;
  }
`;
