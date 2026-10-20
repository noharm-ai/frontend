import styled from "styled-components";

export const CourseListBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  > header {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: space-between;

    .section-title {
      margin: 0;
    }
  }

  .muted {
    color: #8c8c8c;
    font-size: 12px;
  }
`;

// the whole card opens the course
export const CourseCard = styled.button`
  align-items: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #2e3c5a;
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: 8px;
  padding: 12px 14px;
  text-align: left;
  width: 100%;

  &:active {
    background: #f4f8fb;
  }

  .card-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .card-drug {
    align-items: center;
    display: flex;
    gap: 6px;
  }

  .card-name {
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .card-info {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .ant-tag {
      margin: 0;
    }
  }

  .card-evaluation .ant-tag {
    margin: 0;
    white-space: normal;
  }

  .card-open {
    color: #8c8c8c;
    flex-shrink: 0;
  }
`;
