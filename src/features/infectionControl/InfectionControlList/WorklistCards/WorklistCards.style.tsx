import styled from "styled-components";

export const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 80px;
`;

export const Card = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #2e3c5a;
  padding: 12px 14px;

  .card-header {
    align-items: flex-start;
    display: flex;
    gap: 8px;
    justify-content: space-between;
  }

  .card-patient {
    font-size: 15px;
    font-weight: 600;
    min-width: 0;
    overflow-wrap: anywhere;
    padding-top: 4px;
  }

  .card-admission {
    font-size: 13px;
    margin-top: 2px;
  }

  .card-status {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    margin-top: 8px;

    .ant-tag {
      margin: 0;
    }
  }

  .pendings {
    font-size: 13px;
    margin: 8px 0 0 0;
    padding: 0 0 0 16px;
  }

  .card-dates {
    border-top: 1px solid #f0f0f0;
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin: 10px 0 0 0;
    padding-top: 8px;

    dt {
      color: #8c8c8c;
      font-size: 12px;
    }

    dd {
      margin: 0;
    }
  }
`;
