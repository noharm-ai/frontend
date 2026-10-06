import styled from "styled-components";

import { COURSE_COLORS } from "../courseColors";

export const CourseCards = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
`;

export const CourseCard = styled.div<{ $overdue?: boolean }>`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-left: 4px solid
    ${(props) =>
      props.$overdue ? COURSE_COLORS.suspended : COURSE_COLORS.active};
  border-radius: 8px;
  padding: 12px 16px;

  .course-header {
    align-items: center;
    display: flex;
    gap: 6px;
    min-width: 0;
  }

  .course-name {
    color: #2e3c5a;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .course-evaluation {
    margin-top: 6px;
  }

  .course-day {
    align-items: baseline;
    display: flex;
    gap: 8px;
    margin-top: 6px;
  }

  .course-day-number {
    color: ${COURSE_COLORS.active};
    font-size: 28px;
    font-weight: 700;
    line-height: 1.1;
  }

  .course-day-planned {
    color: #8c8c8c;
  }

  .course-dates {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 20px;
    margin: 6px 0 0 0;

    dt {
      color: #8c8c8c;
      font-size: 12px;
    }

    dd {
      color: #2e3c5a;
      margin: 0;
    }

    .muted {
      color: #8c8c8c;
    }
  }

  .hint {
    color: #8c8c8c;
    display: block;
    font-size: 12px;
  }

  .hint-soon {
    color: #d48806;
    font-weight: 500;
  }

  .hint-overdue {
    color: ${COURSE_COLORS.suspended};
    font-weight: 500;
  }

  .course-regimen {
    border-top: 1px solid #f0f0f0;
    color: #2e3c5a;
    margin-top: 10px;
    padding-top: 8px;

    .label {
      color: #8c8c8c;
      display: block;
      font-size: 12px;
    }
  }
`;

export const EmptyCurrent = styled.div`
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  color: #8c8c8c;
  padding: 16px;
  text-align: center;
`;
