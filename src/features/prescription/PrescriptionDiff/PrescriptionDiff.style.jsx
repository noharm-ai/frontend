import styled from "styled-components";

export const DiffContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  margin-bottom: 10px;
  border-radius: 8px;
  line-height: 1.2;

  .anticon {
    margin-right: 1rem;
    font-size: 1.25rem;
  }

  &.plus {
    background: #f6ffed;
    border: 1px solid #b7eb8f;

    .anticon {
      color: #7ebe9a;
    }
  }

  &.minus {
    background: #fff2f0;
    border: 1px solid #ffa39e;

    .anticon {
      color: #f44336;
    }
  }
`;
