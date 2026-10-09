import styled from "styled-components";

export const ReviewList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  > li {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 10px;
    padding: 10px 16px;
  }

  .muted {
    color: #8c8c8c;
  }

  .review-header {
    align-items: baseline;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
  }

  .review-date {
    color: #2e3c5a;
    font-weight: 600;
  }

  .review-author {
    color: #2e3c5a;
  }

  .review-notes {
    color: #2e3c5a;
    margin: 6px 0 0 0;
    white-space: pre-wrap;
  }

  .review-evaluations {
    margin: 8px 0 0 0;
    padding: 0;
    list-style: none;

    li + li {
      margin-top: 4px;
    }
  }

  .review-drug {
    color: #2e3c5a;
    font-weight: 500;
  }

  .review-evaluation-notes {
    color: #595959;
    font-size: 12px;
    margin: 2px 0 0 0;
    white-space: pre-wrap;
  }
`;
